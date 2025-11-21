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
  const atlassianAuthsToUpdate = await selectAtlassianAuth()
    .where('updatedAt', '<=', updatedBefore)
    .execute()
  const updatedAtlassianAuths = (
    await dataLoader.get('freshAtlassianAuth').loadMany(atlassianAuthsToUpdate)
  ).filter((auth) => isNotNull(auth) && isNotError(auth))

  return updatedAtlassianAuths.length
}

export default updateOAuthRefreshTokens
