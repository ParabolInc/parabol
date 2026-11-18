import {GraphQLError} from 'graphql'
import {checkAccess} from '../../../../assetProxyHandler'
import type AuthToken from '../../../../database/types/AuthToken'
import type {AssetType, PartialPath} from '../../../../fileStorage/FileStoreManager'
import {canScopesReadAsset} from '../../../../utils/getAssetOwnerScope'
import type {ResourceGrants} from '../../ResourceGrants'
import type {AssetScopeEnum} from '../../resolverTypes'

const VALID_SCOPES: AssetScopeEnum[] = ['Page', 'User', 'Team', 'Organization']
const VALID_ASSET_TYPES: AssetType[] = ['assets', 'picture', 'metadata', 'template']

export const checkSourceAssetAccess = async (
  sourceUrl: URL,
  authToken: AuthToken,
  resourceGrants: ResourceGrants | null
) => {
  const sourcePartialPath = sourceUrl.pathname.slice('/assets/'.length) as PartialPath
  const [sourceScope, sourceScopeCode, assetType, filename] = sourcePartialPath.split('/') as [
    AssetScopeEnum,
    string,
    AssetType,
    string | undefined
  ]
  if (
    !VALID_SCOPES.includes(sourceScope) ||
    !VALID_ASSET_TYPES.includes(assetType) ||
    !filename ||
    filename.includes('..')
  ) {
    throw new GraphQLError('Invalid asset URL', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const isAPIToken = authToken.aud !== 'action'
  const canAccessSource =
    (!isAPIToken || canScopesReadAsset(authToken.scope, sourceScope, sourceScopeCode, assetType)) &&
    (await checkAccess(
      authToken,
      sourceScope,
      sourceScopeCode,
      assetType,
      resourceGrants ?? undefined
    ))
  if (!canAccessSource) {
    throw new GraphQLError('Access denied to source asset', {extensions: {code: 'FORBIDDEN'}})
  }
  return {sourcePartialPath, assetType, filename}
}
