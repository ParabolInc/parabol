import {GraphQLError} from 'graphql'
import ms from 'ms'
import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

const setTeamLimitAt: MutationResolvers['setTeamLimitAt'] = async (
  _source,
  {teamId, maxTeamLimitAt}
) => {
  // VALIDATION
  const now = new Date()
  const maxAllowed = new Date(now.getTime() + ms('60d'))
  if (maxTeamLimitAt > maxAllowed) {
    throw new GraphQLError('maxTeamLimitAt cannot be more than 60 days in the future')
  }

  // RESOLUTION
  const pg = getKysely()
  const row = await pg
    .updateTable('Team')
    .set({maxTeamTrialExpiresAt: maxTeamLimitAt})
    .where('id', '=', teamId)
    .returning('id')
    .executeTakeFirst()

  if (!row) {
    throw new GraphQLError('Team not found')
  }

  return {teamId: row.id}
}

export default setTeamLimitAt
