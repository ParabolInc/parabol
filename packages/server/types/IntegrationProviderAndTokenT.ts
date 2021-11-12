import {
  IGetIntegrationProvidersByIdsQueryResult as _IntegrationProvider,
  IntegrationProviderTypesEnum as _IntegrationProviderTypesEnum,
  IntegrationProviderScopesEnum as _IntegrationProviderScopesEnum,
  IntegrationProviderTokenTypeEnum as _IntegrationProviderTokenTypeEnum
} from '../postgres/queries/generated/getIntegrationProvidersByIdsQuery'

import {IUpsertIntegrationTokenQueryResult as _IntegrationToken} from '../postgres/queries/generated/upsertIntegrationTokenQuery'

export type IntegrationProviderTypesEnum = _IntegrationProviderTypesEnum
export type IntegrationProviderScopesEnum = _IntegrationProviderScopesEnum
export type IntegrationProviderTokenTypeEnum = _IntegrationProviderTokenTypeEnum
export interface IntegrationProvider extends _IntegrationProvider {}

export interface IntegrationToken extends _IntegrationToken {}

export interface GlobalIntegrationProvider extends Omit<IntegrationProvider, 'orgId' | 'teamId'> {
  scope: Extract<IntegrationProviderScopesEnum, 'GLOBAL'>
  tokenType: Extract<IntegrationProviderTokenTypeEnum, 'OAUTH2'>
}

export type GlobalIntegrationProviderInput = Omit<
  GlobalIntegrationProvider,
  'id' | 'scopeGlobal' | 'createdAt' | 'updatedAt'
>

export interface IntegrationTokenWithProvider extends IntegrationToken {
  provider: IntegrationProvider
}
