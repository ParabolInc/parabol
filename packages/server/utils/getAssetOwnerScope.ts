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

const SERVER_OWNER_CODES: Partial<Record<AssetScopeEnum, string>> = {
  User: 'aGhostUser',
  Organization: 'aGhostOrg'
}

export const canScopesReadAsset = (
  scopes: string[] | undefined,
  assetScope: AssetScopeEnum,
  scopeCode: string,
  assetType: AssetType
) =>
  assetType === 'picture' ||
  SERVER_OWNER_CODES[assetScope] === scopeCode ||
  !!scopes?.includes(getAssetOwnerScope(assetScope, 'read'))

export default getAssetOwnerScope
