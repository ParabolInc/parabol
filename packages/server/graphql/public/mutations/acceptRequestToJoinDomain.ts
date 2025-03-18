import {sql} from 'kysely'
import DomainJoinRequestId from 'parabol-client/shared/gqlIds/DomainJoinRequestId'
import {InvoiceItemType, SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import getKysely from '../../../postgres/getKysely'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import {Logger} from '../../../utils/Logger'
import RedisLock from '../../../utils/RedisLock'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import setUserTierForUserIds from '../../../utils/setUserTierForUserIds'
import standardError from '../../../utils/standardError'
import isValid from '../../isValid'
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
  const viewerTeamMembers = await dataLoader.get('teamMembersByUserId').load(viewerId)
  const validTeamMembers = viewerTeamMembers.filter(
    ({isLead, teamId}) => isLead && teamIds.includes(teamId)
  )

  if (!validTeamMembers.length) {
    return standardError(new Error('Not a team leader'))
  }

  // Provided request domain should match team's organizations activeDomain
  const leadTeams = (await dataLoader.get('teams').loadMany(teamIds)).filter(isValid)
  const orgIds = leadTeams.map((team) => team.orgId)
  const teamOrgs = (await dataLoader.get('organizations').loadMany(orgIds)).filter(isValid)

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
      pg
        .with('UserUpdate', (qc) =>
          qc
            .updateTable('User')
            .set({tms: sql`arr_append_uniq("tms", ${teamId})`})
            .where('id', '=', userId)
        )
        .insertInto('TeamMember')
        .values({
          id: TeamMemberId.join(teamId, userId),
          teamId,
          userId,
          openDrawer: 'manageTeam'
        })
        .onConflict((oc) => oc.column('id').doUpdateSet({isNotRemoved: true, isLead: false}))
        .execute()
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
  dataLoader.clearAll(['users', 'teamMembers'])
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
