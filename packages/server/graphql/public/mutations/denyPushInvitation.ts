import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const denyPushInvitation: MutationResolvers['denyPushInvitation'] = async (
  _source,
  {userId, teamId},
  {authToken, socketId: mutatorId}
) => {
  const pg = getKysely()

  // AUTH
  if (!isTeamMember(authToken, teamId)) {
    throw new GraphQLError('Team not found', {extensions: {code: 'NOT_FOUND'}})
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
    throw new GraphQLError('User did not request push invitation', {extensions: {code: 'CONFLICT'}})
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
