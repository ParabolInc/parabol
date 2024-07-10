import DomainJoinRequestId from 'parabol-client/shared/gqlIds/DomainJoinRequestId'
import {InvoiceItemType, SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'
import getTeamsByIds from '../../../postgres/queries/getTeamsByIds'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import addTeamIdToTMS from '../../../safeMutations/addTeamIdToTMS'
import insertNewTeamMember from '../../../safeMutations/insertNewTeamMember'
import {Logger} from '../../../utils/Logger'
import RedisLock from '../../../utils/RedisLock'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import setUserTierForUserIds from '../../../utils/setUserTierForUserIds'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

// TODO (EXPERIMENT: prompt-to-join-org): some parts are borrowed from acceptTeamInvitation, create generic functions
const acceptRequestToJoinDomain: MutationResolvers['acceptRequestToJoinDomain'] = async (
  _source,
  {requestId, teamIds},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)
  const now = new Date()
  const pg = getKysely()
  const r = await getRethink()

  // Fetch the request that is not expired
  const request = await pg
    .selectFrom('DomainJoinRequest')
    .selectAll()
    .where('id', '=', DomainJoinRequestId.split(requestId))
    .where('expiresAt', '>', now)
    .executeTakeFirst()

  if (!request) {
    return standardError(new Error('Request expired'))
  }

  const {createdBy, domain} = request

  // Viewer must be a lead of the provided teamIds
  const validTeamMembers = await r
    .table('TeamMember')
    .getAll(r.args(teamIds), {index: 'teamId'})
    .filter({isLead: true, userId: viewerId})
    .run()

  if (!validTeamMembers.length) {
    return standardError(new Error('Not a team leader'))
  }

  // Provided request domain should match team's organizations activeDomain
  const leadTeams = await getTeamsByIds(validTeamMembers.map((teamMember) => teamMember.teamId))
  const teamOrgs = await Promise.all(
    leadTeams.map((t) => dataLoader.get('organizations').loadNonNull(t.orgId))
  )
  const validOrgIds = teamOrgs.filter((org) => org.activeDomain === domain).map(({id}) => id)

  if (!validOrgIds.length) {
    return standardError(new Error('Invalid organizations'))
  }

  const validTeams = leadTeams.filter((team) => validOrgIds.includes(team.orgId))

  if (!validTeams.length) {
    return standardError(new Error('Invalid teams'))
  }

  // Avoid race conditions: we make changes based on the data fetched first, see insertNewTeamMember
  const ttl = 3000
  const redisLock = new RedisLock(`acceptRequestToJoinDomain:${request.id}`, ttl)
  const lockTTL = await redisLock.checkLock()
  if (lockTTL > 0) {
    return {
      error: {message: `You already called this ${ttl - lockTTL}ms ago!`}
    }
  }

  const user = await getUserById(createdBy)
  if (!user) {
    return standardError(new Error('User not found'))
  }

  const {id: userId} = user

  for (const validTeam of validTeams) {
    const {id: teamId, orgId} = validTeam
    const [organizationUser] = await Promise.all([
      dataLoader.get('organizationUsersByUserIdOrgId').load({orgId, userId}),
      insertNewTeamMember(user, teamId),
      addTeamIdToTMS(userId, teamId)
    ])

    if (!organizationUser) {
      try {
        await adjustUserCount(userId, orgId, InvoiceItemType.ADD_USER, dataLoader)
      } catch (e) {
        Logger.log(e)
      }
      await setUserTierForUserIds([userId])
    }
  }

  await redisLock.unlock()

  // Send the new team member a welcome & a new token
  const updatedUser = await getUserById(createdBy)
  if (!updatedUser) {
    return standardError(new Error('User not found'))
  }
  publish(SubscriptionChannel.NOTIFICATION, userId, 'AuthTokenPayload', {tms: updatedUser.tms})

  validTeams.forEach((team) => {
    const {id: teamId} = team
    const teamMemberId = toTeamMemberId(teamId, userId)
    const data = {
      teamId,
      teamMemberId
    }

    // Tell the rest of the team about the new team member
    publish(SubscriptionChannel.TEAM, teamId, 'AcceptTeamInvitationPayload', data, subOptions)

    // Send individualized message to the user
    publish(
      SubscriptionChannel.NOTIFICATION,
      userId,
      'AcceptTeamInvitationPayload',
      data,
      subOptions
    )
  })

  return {viewerId}
}

export default acceptRequestToJoinDomain
