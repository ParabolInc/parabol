import {
  IGetIntegrationProvidersByIdsQueryResult as _IntegrationProvider,
  IntegrationProviderTypesEnum as _IntegrationProviderTypesEnum,
  IntegrationProviderScopesEnum as _IntegrationProviderScopesEnum,
  IntegrationProviderTokenTypeEnum as _IntegrationProviderTokenTypeEnum
} from '../queries/generated/getIntegrationProvidersByIdsQuery'

export type IntegrationProviderTypesEnum = _IntegrationProviderTypesEnum
export type IntegrationProviderScopesEnum = _IntegrationProviderScopesEnum
export type IntegrationProviderTokenTypeEnum = _IntegrationProviderTokenTypeEnum

/**
 * Represents a single integration provider.
 * Depending on the {@link IntegrationProvider.type} metadata will have a different structure.
 * @see {@link OAuth2IntegrationProviderMetadata}
 */
export interface IntegrationProvider extends Omit<_IntegrationProvider, 'providerMetadata'> {
  providerMetadata: IntegrationProviderMetadata
}

/**
 * Metadata structure of the OAuth2 integration provider.
 */
export interface OAuth2IntegrationProviderMetadata {
  scopes: string[]
  clientId: string
  clientSecret: string
  serverBaseUrl: string
}

/**
 * Metadata structure of the WebHook integration provider.
 */
interface WebHookIntegrationProviderMetadata {
  webhookUrl: string
}

/**
 * Union type representing all the possible types of integration providers
 */
export type IntegrationProviderMetadata =
  | OAuth2IntegrationProviderMetadata
  | WebHookIntegrationProviderMetadata

const mapToOAuth2IntegrationProviderMetadata = (
  providerMetadata: any
): OAuth2IntegrationProviderMetadata => {
  const {scopes, clientId, clientSecret, serverBaseUrl} = providerMetadata
  return {scopes, clientId, clientSecret, serverBaseUrl}
}

const mapToWebHookIntegrationProviderMetadata = (providerMetadata: any) => {
  const {webhookUrl} = providerMetadata
  return {webhookUrl}
}

/**
 * Parse the integration provider metadata from the database as a proper {@link IntegrationProviderMetadata}
 * Used when data is fetched from the database.
 * @param providerTokenType
 * @param providerMetadata
 * @returns properly typed {@link IntegrationProviderMetadata}
 */
export const mapToIntegrationProviderMetadata = (
  providerTokenType: IntegrationProviderTokenTypeEnum,
  providerMetadata: any
): IntegrationProviderMetadata => {
  if (providerTokenType === 'oauth2') {
    return mapToOAuth2IntegrationProviderMetadata(providerMetadata)
  }

  if (providerTokenType === 'webhook') {
    return mapToWebHookIntegrationProviderMetadata(providerMetadata)
  }

  // fail early, this should never happen in production, aka famous last words
  throw new Error(`Unsupported provider token type: ${providerTokenType}`)
}

export const isOAuth2ProviderMetadata = (
  providerMetadata: IntegrationProviderMetadata
): providerMetadata is OAuth2IntegrationProviderMetadata => {
  const maybeOAuth2ProviderMetadata = providerMetadata as OAuth2IntegrationProviderMetadata
  return (
    maybeOAuth2ProviderMetadata.clientId !== undefined &&
    maybeOAuth2ProviderMetadata.clientSecret !== undefined &&
    maybeOAuth2ProviderMetadata.scopes !== undefined &&
    maybeOAuth2ProviderMetadata.serverBaseUrl !== undefined
  )
}

export const isWebHookProviderMetadata = (
  providerMetadata: IntegrationProviderMetadata
): providerMetadata is WebHookIntegrationProviderMetadata => {
  const maybeWebhookProviderMetadata = providerMetadata as WebHookIntegrationProviderMetadata
  return maybeWebhookProviderMetadata.webhookUrl !== undefined
}

export interface IntegrationProviderInput {
  id: string
  name: string
  orgId: string
  teamId: string
  type: IntegrationProviderTypesEnum
  tokenType: IntegrationProviderTokenTypeEnum
  scope: IntegrationProviderScopesEnum
  providerMetadata: any
}

export interface GlobalIntegrationProviderInsertParams {
  type: IntegrationProviderTypesEnum
  name: string
  providerMetadata: Record<string, string>
}

export interface IntegrationProviderInsertParams {
  name: string
  orgId: string
  teamId: string
  type: IntegrationProviderTypesEnum
  tokenType: IntegrationProviderTokenTypeEnum
  scope: IntegrationProviderScopesEnum
  providerMetadata: Record<string, string>
}

export const createGlobalIntegrationProviderUpsertParams = (
  provider: Omit<IntegrationProviderInput, 'id' | 'scope' | 'orgId' | 'teamId'>
): GlobalIntegrationProviderInsertParams => {
  const newIntegrationProviderMetadata = provider.providerMetadata
  if (!isOAuth2ProviderMetadata(newIntegrationProviderMetadata)) {
    throw new Error('Global provider can be only OAuth2!')
  }

  return {
    name: provider.name,
    type: provider.type,
    providerMetadata: provider.providerMetadata
  }
}

export const createIntegrationProviderInsertParams = (
  provider: Omit<IntegrationProviderInput, 'id'>
): IntegrationProviderInsertParams => {
  return {
    name: provider.name,
    type: provider.type,
    tokenType: provider.tokenType,
    scope: provider.scope,
    orgId: provider.orgId,
    teamId: provider.teamId,
    providerMetadata: provider.providerMetadata
  }
}
