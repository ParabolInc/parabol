import {
  IGetIntegrationProvidersByIdsQueryResult as _IntegrationProvider,
  IntegrationProviderTypesEnum as _IntegrationProviderTypesEnum,
  IntegrationProviderScopesEnum as _IntegrationProviderScopesEnum,
  IntegrationProvidersEnum as _IntegrationProvidersEnum
} from '../queries/generated/getIntegrationProvidersByIdsQuery'

export type IntegrationProviderTypesEnum = _IntegrationProviderTypesEnum
export type IntegrationProviderScopesEnum = _IntegrationProviderScopesEnum
export type IntegrationProvidersEnum = _IntegrationProvidersEnum

/**
 * Represents a single integration provider.
 * Integration provider spefic data is kept in the providerMetadata field (JSONB).
 * Depending on the {@link IntegrationProvider.type} metadata will have a different structure,
 * @see {@link OAuth2IntegrationProviderMetadata} and {@link WebHookIntegrationProviderMetadata}.
 *
 * To add a global integration provider
 * 1. If it's a new provider, add a new provider to the {@link IntegrationProvidersEnum} via migration
 * 2. To make it availabe to all users, configure new integration in {@link makeGlobalIntegrationProvidersFromEnv}, it'll be automatically added to the database via postdeploy script
 * 3. New integration can also be added in runtime by calling {@link addIntegrationProvider} mutation by superuser
 *
 * When adding a new integration provider with a new authentication type (not defined in {@link IntegrationProviderTypesEnum}), a few additional steps is required
 * 1. Add a new type to the {@link IntegrationProviderTypesEnum} via migration
 * 2. If there's any speficic data needed to be store by the integration provider define a new type, similar to {@link OAuth2IntegrationProviderMetadata} and {@link WebHookIntegrationProviderMetadata}
 * 3. Make sure to add a case in {@link mapToIntegrationProviderMetadata} to get properly typed data from the providerMetadata field
 * 4. Update {@link addIntegrationProvider} mutation to handle the new type properly
 * 5. Update {@link updateIntegrationProvider} mutation to handle the new type properly
 * 6. If new integration provider requires authorization, update {@link addIntegrationToken} mutation to handle it properly
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
 * @param providerType
 * @param providerMetadata
 * @returns properly typed {@link IntegrationProviderMetadata}
 */
export const mapToIntegrationProviderMetadata = (
  providerType: IntegrationProviderTypesEnum,
  providerMetadata: any
): IntegrationProviderMetadata => {
  if (providerType === 'oauth2') {
    return mapToOAuth2IntegrationProviderMetadata(providerMetadata)
  }

  if (providerType === 'webhook') {
    return mapToWebHookIntegrationProviderMetadata(providerMetadata)
  }

  // fail early, this should never happen in production, aka famous last words
  throw new Error(`Unsupported provider type: ${providerType}`)
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
  provider: IntegrationProvidersEnum
  type: IntegrationProviderTypesEnum
  scope: IntegrationProviderScopesEnum
  webhookProviderMetadataInput?: {
    webhookUrl: string
  }
  oAuth2ProviderMetadataInput?: {
    scopes: string[]
    clientId: string
    clientSecret: string
    serverBaseUrl: string
  }
}

export interface GlobalIntegrationProviderInsertParams {
  provider: IntegrationProvidersEnum
  name: string
  providerMetadata: Record<string, string | string[]>
}

export const createGlobalIntegrationProviderUpsertParams = (
  integrationProvider: Omit<IntegrationProviderInput, 'id' | 'scope' | 'orgId' | 'teamId'>
): GlobalIntegrationProviderInsertParams => {
  const newIntegrationProviderMetadata = integrationProvider.oAuth2ProviderMetadataInput
  if (
    !newIntegrationProviderMetadata ||
    !isOAuth2ProviderMetadata(newIntegrationProviderMetadata)
  ) {
    throw new Error('Global provider can be only OAuth2!')
  }

  return {
    name: integrationProvider.name,
    provider: integrationProvider.provider,
    providerMetadata: {...newIntegrationProviderMetadata}
  }
}

export interface IntegrationProviderInsertParams {
  name: string
  orgId: string
  teamId: string
  provider: IntegrationProvidersEnum
  type: IntegrationProviderTypesEnum
  scope: IntegrationProviderScopesEnum
  providerMetadata: Record<string, string | string[]>
}

export const createIntegrationProviderInsertParams = (
  integrationProvider: Omit<IntegrationProviderInput, 'id'>
): IntegrationProviderInsertParams => {
  let providerMetadata: Record<string, string | string[]> = {}
  if (integrationProvider.type === 'oauth2') {
    providerMetadata = integrationProvider.oAuth2ProviderMetadataInput!
  } else if (integrationProvider.type === 'webhook') {
    providerMetadata = integrationProvider.webhookProviderMetadataInput!
  }

  return {
    name: integrationProvider.name,
    provider: integrationProvider.provider,
    type: integrationProvider.type,
    scope: integrationProvider.scope,
    orgId: integrationProvider.orgId,
    teamId: integrationProvider.teamId,
    providerMetadata
  }
}
