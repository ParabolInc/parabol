import {GraphQLError} from 'graphql'
import ms from 'ms'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isAuthenticated} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import {getIsUserIdApprovedByOrg} from './helpers/getIsUserIdApprovedByOrg'

const MAX_GLOBAL_DENIALS = 3
const GLOBAL_DENIAL_TIME = ms('30d')
const MAX_TEAM_DENIALS = 2

const pushInvitation: MutationResolvers['pushInvitation'] = async (
  _source,
  {meetingId, teamId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)
  const thresh = new Date(Date.now() - GLOBAL_DENIAL_TIME)

  // AUTH
  if (!isAuthenticated(authToken))
    throw new GraphQLError('Not authenticated', {extensions: {code: 'UNAUTHENTICATED'}})

  // VALIDATION
  const team = await dataLoader.get('teams').load(teamId)
  if (!team) {
    throw new GraphQLError('Invalid teamId', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  const {orgId} = team
  const approvalError = await getIsUserIdApprovedByOrg(viewerId, orgId, dataLoader)
  if (approvalError instanceof Error) {
    throw new GraphQLError(approvalError.message, {extensions: {code: 'FORBIDDEN'}})
  }
  const pushInvitations = await pg
    .selectFrom('PushInvitation')
    .selectAll()
    .where('userId', '=', viewerId)
    .execute()

  const teamPushInvitation = pushInvitations.find((row) => row.teamId === teamId)
  if (teamPushInvitation) {
    const {denialCount, lastDenialAt} = teamPushInvitation
    if (denialCount >= MAX_TEAM_DENIALS && lastDenialAt && lastDenialAt >= thresh) {
      throw new GraphQLError('Previously denied. Must wait for an invitation', {
        extensions: {code: 'CONFLICT'}
      })
    }
  }

  const globalBlacklist = pushInvitations.filter(
    ({lastDenialAt}) => lastDenialAt && lastDenialAt >= thresh
  )
  if (globalBlacklist.length >= MAX_GLOBAL_DENIALS) {
    throw new GraphQLError('Denied from other teams. Must wait for an invitation', {
      extensions: {code: 'CONFLICT'}
    })
  }

  // RESOLUTION
  if (!teamPushInvitation) {
    await pg.insertInto('PushInvitation').values({userId: viewerId, teamId}).execute()
  }

  const data = {userId: viewerId, teamId, meetingId}
  publish(SubscriptionChannel.TEAM, teamId, 'PushInvitationPayload', data, subOptions)
  return null
}

export default pushInvitation
