import {IUpsertIntegrationTokenQueryResult as _IntegrationToken} from '../queries/generated/upsertIntegrationTokenQuery'
import {IntegrationProviderTypeEnum} from './IntegrationProvider'

/**
 * Union type representing all the possible types of integration tokens
 */
export type IntegrationTokenMetadata = any

const mapToOAuth2IntegrationTokenMetadata = (metadata: any) => {
  const {accessToken, refreshToken, scopes} = metadata
  return {accessToken, refreshToken, scopes}
}

/**
 * Parse the integration provider token metadata from the database as a proper {@link IntegrationTokenMetadata}
 * Used when data is fetched from the database.
 * @param providerType
 * @param metadata
 * @returns properly typed {@link IntegrationTokenMetadata}
 */
export const mapToIntegrationTokenMetadata = (
  providerType: IntegrationProviderTypeEnum,
  metadata: any
) => {
  if (providerType === 'oauth2') {
    return mapToOAuth2IntegrationTokenMetadata(metadata)
  }

  // fail early, this should never happen in production, aka famous last words
  throw new Error(`Unsupported provider token type: ${providerType}`)
}

/**
 * Represents a single integration authorization token.
 * Depending on the {@link IntegrationProvider.type} metadata will have a different structure.
 * @see {@link IntegrationTokenMetadata}
 */
export interface IntegrationToken extends Omit<_IntegrationToken, 'tokenMetadata'> {
  tokenMetadata: IntegrationTokenMetadata
}
