import getPg from '../getPg'
import {
  getIntegrationProvidersByIdsQuery,
  IGetIntegrationProvidersByIdsQueryResult,
  IntegrationProviderScopeEnum
} from './generated/getIntegrationProvidersByIdsQuery'

interface IntegrationProviderActive extends IGetIntegrationProvidersByIdsQueryResult {
  isActive: true
}

interface IntegrationProviderWebhook extends IntegrationProviderActive {
  authStrategy: 'webhook'
  webhookUrl: string
}

interface IntegrationProviderOAuth1 extends IntegrationProviderActive {
  authStrategy: 'oauth1'
  consumerKey: string
  consumerSecret: string
  serverBaseUrl: string
}

interface IntegrationProviderOAuth2 extends IntegrationProviderActive {
  authStrategy: 'oauth2'
  clientId: string
  clientSecret: string
  serverBaseUrl: string
  tenantId: string
}

// Not used yet
interface IntegrationProviderPAT extends IntegrationProviderActive {
  authStrategy: 'pat'
  clientId: string
}

export interface IntegrationProviderMattermostPlugin extends IntegrationProviderActive {
  service: 'mattermost'
  authStrategy: 'sharedSecret'
  serverBaseUrl: string
  sharedSecret: string
}

export interface IntegrationProviderMattermostWebhook
  extends Omit<IntegrationProviderWebhook, 'scope'> {
  service: 'mattermost'
  scope: Omit<IntegrationProviderScopeEnum, 'global'>
  scopeGlobal: false
}

export type IntegrationProviderMattermost =
  | IntegrationProviderMattermostPlugin
  | IntegrationProviderMattermostWebhook

export interface IntegrationProviderGcalOAuth2 extends IntegrationProviderOAuth2 {
  service: 'gcal'
}
export interface IntegrationProviderGitLabOAuth2 extends IntegrationProviderOAuth2 {
  service: 'gitlab'
}

export interface IntegrationProviderGitLabPAT extends IntegrationProviderPAT {
  service: 'gitlab'
}

export interface IntegrationProviderJiraServer extends IntegrationProviderOAuth1 {
  service: 'jiraServer'
}
export interface IntegrationProviderLinear extends IntegrationProviderOAuth2 {
  service: 'linear'
}
export interface IntegrationProviderMSTeams extends IntegrationProviderWebhook {
  service: 'msTeams'
}

export interface IntegrationProviderAzureDevOps extends IntegrationProviderOAuth2 {
  service: 'azureDevOps'
  tenantId: string
}

export type TIntegrationProvider =
  | IntegrationProviderMattermost
  | IntegrationProviderGitLabOAuth2
  | IntegrationProviderGitLabPAT
  | IntegrationProviderJiraServer
  | IntegrationProviderAzureDevOps
  | IntegrationProviderMSTeams
  | IntegrationProviderGcalOAuth2
  | IntegrationProviderLinear

const getIntegrationProvidersByIds = async <T = TIntegrationProvider>(ids: readonly number[]) => {
  const providers = await getIntegrationProvidersByIdsQuery.run({ids}, getPg())
  return providers as any as T[]
}

export default getIntegrationProvidersByIds
