import {
  IGetIntegrationProvidersByIdsQueryResult as _IntegrationProvider,
  IntegrationProvidersEnum as _IntegrationProvidersEnum,
  IntegrationProviderScopesEnum as _IntegrationProviderScopesEnum,
  IntegrationProviderTokenTypeEnum as _IntegrationProviderTokenTypeEnum
} from '../postgres/queries/generated/getIntegrationProvidersByIdsQuery'

import {IUpsertIntegrationTokenQueryResult as _IntegrationToken} from '../postgres/queries/generated/upsertIntegrationTokenQuery'

export type IntegrationProvidersEnum = _IntegrationProvidersEnum
export type IntegrationProviderScopesEnum = _IntegrationProviderScopesEnum
export type IntegrationProviderTokenTypeEnum = _IntegrationProviderTokenTypeEnum
export interface IntegrationProvider extends _IntegrationProvider {}

export interface IntegrationToken extends _IntegrationToken {}

export interface GlobalIntegrationProvider extends Omit<IntegrationProvider, 'orgId' | 'teamId'> {
  providerScope: Extract<IntegrationProviderScopesEnum, 'GLOBAL'>
  providerTokenType: Extract<IntegrationProviderTokenTypeEnum, 'OAUTH2'>
}

export type GlobalIntegrationProviderInput = Omit<
  GlobalIntegrationProvider,
  'id' | 'createdAt' | 'updatedAt'
>

export interface IntegrationTokenWithProvider extends IntegrationToken {
  provider: IntegrationProvider
}
