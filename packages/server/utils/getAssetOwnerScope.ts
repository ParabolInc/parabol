import type {AssetType} from '../fileStorage/FileStoreManager'
import type {AssetScopeEnum} from '../graphql/public/resolverTypes'
import type {Oauthscopeenum} from '../postgres/types/pg'

const OWNER_SCOPE_PREFIXES = {
  Page: 'pages',
  Team: 'teams',
  Organization: 'orgs',
  User: 'users'
} as const satisfies Record<AssetScopeEnum, string>

const getAssetOwnerScope = (assetScope: AssetScopeEnum, access: 'read' | 'write'): Oauthscopeenum =>
  `${OWNER_SCOPE_PREFIXES[assetScope]}:${access}`

export const canScopesReadAsset = (
  scopes: string[] | undefined,
  assetScope: AssetScopeEnum,
  assetType: AssetType
) => assetType === 'picture' || !!scopes?.includes(getAssetOwnerScope(assetScope, 'read'))

export default getAssetOwnerScope
