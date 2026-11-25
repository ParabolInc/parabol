import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {RuleContext} from '../../graphql'
import {getUserAssetLocation} from '../mutations/helpers/getUserAssetLocation'
import {validateScope} from '../mutations/uploadUserAsset'
import type {MutationDeleteUserAssetArgs} from '../resolverTypes'

export const canDeleteUserAsset = rule('canDeleteUserAsset', {cache: 'strict'})(
  async (
    _source,
    {url}: MutationDeleteUserAssetArgs,
    {authToken, dataLoader, resourceGrants}: RuleContext
  ) => {
    if (!authToken) return false
    try {
      const {scope, scopeKey} = getUserAssetLocation(url)
      if (scope === 'User' && resourceGrants && !resourceGrants.isUnrestricted()) {
        return new GraphQLError(
          'A connection limited to some organizations, teams or pages cannot delete your own files',
          {extensions: {code: 'FORBIDDEN'}}
        )
      }
      await validateScope(authToken, scope, scopeKey, dataLoader, resourceGrants)
    } catch (error) {
      if (error instanceof GraphQLError) return error
      throw error
    }
    return true
  }
)
