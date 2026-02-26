import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const denyPushInvitation: MutationResolvers['denyPushInvitation'] = async (
  _source,
  {userId, teamId},
  {authToken, socketId: mutatorId}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)

  // AUTH
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  // VALIDATION
  const teamBlacklist = await pg
    .selectFrom('PushInvitation')
    .selectAll()
    .where('userId', '=', userId)
    .where('teamId', '=', teamId)
    .limit(1)
    .executeTakeFirst()

  if (!teamBlacklist) {
    return standardError(new Error('User did not request push invitation'), {userId: viewerId})
  }

  // RESOLUTION
  await pg
    .updateTable('PushInvitation')
    .set((eb) => ({
      denialCount: eb('denialCount', '+', 1),
      lastDenialAt: sql`CURRENT_TIMESTAMP`
    }))
    .where('id', '=', teamBlacklist.id)
    .execute()

  const data = {teamId, userId}
  publish(SubscriptionChannel.TEAM, teamId, 'DenyPushInvitationPayload', data, {mutatorId})
  return data
}

export default denyPushInvitation
