import {isNotNull} from 'parabol-client/utils/predicates'
import {selectAtlassianAuth} from '../../../postgres/select'
import isNotError from '../../errorFilter'
import type {MutationResolvers} from '../resolverTypes'

const updateOAuthRefreshTokens: MutationResolvers['updateOAuthRefreshTokens'] = async (
  _source,
  {updatedBefore},
  {dataLoader}
) => {
  // RESOLUTION
  const atlassianAuthRows = await selectAtlassianAuth()
    .where('updatedAt', '<=', updatedBefore)
    .where('isActive', '=', true)
    .execute()
  // distinct on userId, since freshAtlassianAuth will renew all active tokens across all teams for a user
  const atlassianAuthsToUpdate = [
    ...new Map(atlassianAuthRows.map((row) => [row.userId, row])).values()
  ]
  const updatedAtlassianAuths = (
    await dataLoader.get('freshAtlassianAuth').loadMany(atlassianAuthsToUpdate)
  ).filter((auth) => isNotNull(auth) && isNotError(auth))

  return updatedAtlassianAuths.length
}

export default updateOAuthRefreshTokens
