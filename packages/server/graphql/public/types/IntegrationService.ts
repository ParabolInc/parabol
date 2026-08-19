import {
  getServerIntegration,
  type RegisteredServerIntegration
} from '../../../integrations/platform/registry'
import type {IntegrationCapabilityKey} from '../../../integrations/platform/ServerIntegrationDefinition'
import type {IntegrationServiceResolvers} from '../resolverTypes'

export type IntegrationServiceSource = {
  service: RegisteredServerIntegration
  title: string
  capabilities: IntegrationCapabilityKey[]
  teamId: string
  userId: string
}

const TYPENAME_BY_SERVICE = {
  azureDevOps: 'AzureDevOpsIntegrationService',
  github: 'GitHubIntegrationService',
  gitlab: 'GitLabIntegrationService',
  jira: 'JiraIntegrationService',
  jiraServer: 'JiraServerIntegrationService',
  linear: 'LinearIntegrationService'
} as const

const IntegrationService: IntegrationServiceResolvers = {
  __resolveType: ({service}) => TYPENAME_BY_SERVICE[service],
  isAvailable: ({service, teamId, userId}, _args, {dataLoader}) =>
    getServerIntegration(service).isAvailable({dataLoader, teamId, userId}),
  isConnected: ({service, teamId, userId}, _args, {dataLoader}) =>
    getServerIntegration(service).isConnected({dataLoader, teamId, userId})
}

export default IntegrationService
