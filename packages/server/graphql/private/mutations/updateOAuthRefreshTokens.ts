import {isNotNull} from 'parabol-client/utils/predicates'
import getAtlassianAuthsToUpdate from '../../../postgres/queries/getAtlassianAuthsToUpdate'
import isNotError from '../../errorFilter'
import {MutationResolvers} from '../resolverTypes'

const updateOAuthRefreshTokens: MutationResolvers['updateOAuthRefreshTokens'] = async (
  _source,
  {updatedBefore},
  {dataLoader}
) => {
  // RESOLUTION
  const atlassianAuthsToUpdate = await getAtlassianAuthsToUpdate(updatedBefore)
  const updatedAtlassianAuths = (
    await dataLoader.get('freshAtlassianAuth').loadMany(atlassianAuthsToUpdate)
  ).filter((auth) => isNotNull(auth) && isNotError(auth))

  return updatedAtlassianAuths.length
}

export default updateOAuthRefreshTokens
