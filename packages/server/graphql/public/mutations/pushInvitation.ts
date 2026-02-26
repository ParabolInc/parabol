import ms from 'ms'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isAuthenticated} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
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
  if (!isAuthenticated(authToken)) return standardError(new Error('Not authenticated'))

  // VALIDATION
  const team = await dataLoader.get('teams').load(teamId)
  if (!team) {
    return {error: {message: 'Invalid teamId'}}
  }

  const {orgId} = team
  const approvalError = await getIsUserIdApprovedByOrg(viewerId, orgId, dataLoader)
  if (approvalError instanceof Error) {
    return {error: {message: approvalError.message}}
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
      return standardError(new Error('Previously denied. Must wait for an invitation'), {
        userId: viewerId
      })
    }
  }

  const globalBlacklist = pushInvitations.filter(
    ({lastDenialAt}) => lastDenialAt && lastDenialAt >= thresh
  )
  if (globalBlacklist.length >= MAX_GLOBAL_DENIALS) {
    return standardError(new Error('Denied from other teams. Must wait for an invitation'), {
      userId: viewerId
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
