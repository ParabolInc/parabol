import {
  getServerIntegration,
  type RegisteredServerIntegration
} from '../../../integrations/platform/registry'
import type {IntegrationCapabilityKey} from '../../../integrations/platform/ServerIntegrationDefinition'
import {getUserId} from '../../../utils/authorization'
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
    getServerIntegration(service).isConnected({dataLoader, teamId, userId}),
  auth: ({service, teamId, userId}, _args, {authToken, dataLoader}) => {
    if (getUserId(authToken) !== userId) return null
    return dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service, teamId, userId})
  },
  cloudProvider: async ({service}, _args, {dataLoader}) => {
    const [globalProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service, orgIds: [], teamIds: []})
    return globalProvider ?? null
  }
}

export default IntegrationService
