import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'
import getKysely from '../../../postgres/getKysely'
import standardError from '../../../utils/standardError'
import getRethink from '../../../database/rethinkDriver'
import getTeamsByIds from '../../../postgres/queries/getTeamsByIds'
import RedisLock from '../../../utils/RedisLock'
import insertNewTeamMember from '../../../safeMutations/insertNewTeamMember'
import addTeamIdToTMS from '../../../safeMutations/addTeamIdToTMS'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import {InvoiceItemType, SubscriptionChannel} from 'parabol-client/types/constEnums'
import setUserTierForUserIds from '../../../utils/setUserTierForUserIds'
import publish from '../../../utils/publish'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import DomainJoinRequestId from 'parabol-client/shared/gqlIds/DomainJoinRequestId'
import {getUserById} from '../../../postgres/queries/getUsersByIds'

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
  const validOrgIds = await r
    .table('Organization')
    .getAll(r.args(leadTeams.map((team) => team.orgId)))
    .filter({activeDomain: domain})('id')
    .run()

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

  const {id: userId} = user

  for (const validTeam of validTeams) {
    const {id: teamId, orgId} = validTeam
    const [organizationUser] = await Promise.all([
      r
        .table('OrganizationUser')
        .getAll(userId, {index: 'userId'})
        .filter({orgId, removedAt: null})
        .nth(0)
        .default(null)
        .run(),
      insertNewTeamMember(user, teamId),
      addTeamIdToTMS(userId, teamId)
    ])

    if (!organizationUser) {
      try {
        await adjustUserCount(userId, orgId, InvoiceItemType.ADD_USER)
      } catch (e) {
        console.log(e)
      }
      await setUserTierForUserIds([userId])
    }
  }

  await redisLock.unlock()

  // Send the new team member a welcome & a new token
  const updatedUser = await getUserById(createdBy)
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
    publish(SubscriptionChannel.TEAM, userId, 'AcceptTeamInvitationPayload', data, subOptions)
  })

  return {viewerId}
}

export default acceptRequestToJoinDomain
