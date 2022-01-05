import getPg from '../getPg'
import {
  getIntegrationProvidersByIdsQuery,
  IGetIntegrationProvidersByIdsQueryResult,
  IntegrationProviderScopeEnum
} from './generated/getIntegrationProvidersByIdsQuery'

export interface IntegrationProviderOAuth2Metadata {
  clientId: string
  clientSecret: string
  serverBaseUrl: string
}

export interface IntegrationProviderWebhookMetadata {
  webhookUrl: string
}

export type IntegrationProviderMetadata =
  | IntegrationProviderOAuth2Metadata
  | IntegrationProviderWebhookMetadata

interface IntegrationProviderActive extends IGetIntegrationProvidersByIdsQueryResult {
  isActive: true
  providerMetadata: any
}

interface IntegrationProviderWebhook extends IntegrationProviderActive {
  type: 'webhook'
  providerMetadata: IntegrationProviderWebhookMetadata
}

interface IntegrationProviderOAuth2 extends IntegrationProviderActive {
  type: 'oauth2'
  providerMetadata: IntegrationProviderOAuth2Metadata
}

interface IntegrationProviderPAT extends IntegrationProviderActive {
  type: 'pat'
  providerMetadata: IntegrationProviderOAuth2Metadata
}

export interface IntegrationProviderMattermost extends Omit<IntegrationProviderWebhook, 'scope'> {
  service: 'mattermost'
  scope: Omit<IntegrationProviderScopeEnum, 'global'>
  scopeGlobal: false
}

export interface IntegrationProviderGitLabOAuth2 extends IntegrationProviderOAuth2 {
  service: 'gitlab'
}

export interface IntegrationProviderGitLabPAT extends IntegrationProviderPAT {
  service: 'gitlab'
}

export type TIntegrationProvider =
  | IntegrationProviderMattermost
  | IntegrationProviderGitLabOAuth2
  | IntegrationProviderGitLabPAT

const getIntegrationProvidersByIds = async <T = TIntegrationProvider>(ids: readonly number[]) => {
  const providers = await getIntegrationProvidersByIdsQuery.run({ids}, getPg())
  return providers as any as T[]
}

export default getIntegrationProvidersByIds
