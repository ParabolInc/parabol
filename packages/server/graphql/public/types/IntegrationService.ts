import IntegrationServiceId from '../../../../client/shared/gqlIds/IntegrationServiceId'
import loadServiceRepoIntegrations from '../../../integrations/loadServiceRepoIntegrations'
import {
  getServerIntegration,
  type RegisteredServerIntegration
} from '../../../integrations/platform/registry'
import type {
  IntegrationCapabilityKey,
  ServerIntegrationDefinition
} from '../../../integrations/platform/ServerIntegrationDefinition'
import type {IntegrationServiceResolvers} from '../resolverTypes'

export type IntegrationServiceSource = {
  service: RegisteredServerIntegration
  title: string
  capabilities: IntegrationCapabilityKey[]
  teamId: string
  userId: string
}

export const makeIntegrationServiceSource = (
  service: RegisteredServerIntegration,
  teamId: string,
  userId: string
): IntegrationServiceSource => {
  const definition = getServerIntegration(service)
  return {
    service,
    title: definition.title,
    capabilities: definition.getCapabilityKeys(),
    teamId,
    userId
  }
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
  id: ({service, teamId, userId}) => IntegrationServiceId.join(teamId, userId, service),
  isAvailable: ({service, teamId, userId}, _args, {dataLoader}) =>
    getServerIntegration(service).isAvailable({dataLoader, teamId, userId}),
  isConnected: ({service, teamId, userId}, _args, {dataLoader}) =>
    getServerIntegration(service).isConnected({dataLoader, teamId, userId}),
  auth: ({service, teamId, userId}, _args, {dataLoader}) =>
    getServerIntegration(service).getAuthRow({dataLoader, teamId, userId}),
  cloudProvider: ({service, teamId, userId}, _args, {dataLoader}) =>
    getServerIntegration(service).getGlobalProvider({dataLoader, teamId, userId}),
  sharedProviders: ({service, teamId, userId}, _args, {dataLoader}) =>
    getServerIntegration(service).getSharedProviders({dataLoader, teamId, userId}),
  grantedScopes: async ({service, teamId, userId}, _args, {dataLoader}) => {
    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service, teamId, userId})
    return auth?.scopes?.split(/[\s,]+/).filter(Boolean) ?? []
  },
  repos: ({service, teamId, userId}, {networkOnly}, context, info) =>
    loadServiceRepoIntegrations(
      service,
      {dataLoader: context.dataLoader, teamId, userId, context, info},
      !!networkOnly
    ),
  searchQueries: async ({service, teamId, userId}, _args, {dataLoader}) => {
    const definition: ServerIntegrationDefinition = getServerIntegration(service)
    if (!definition.capabilities.issueSearch) return []
    const auth = await definition.getAuthRow({dataLoader, teamId, userId})
    if (!auth) return []
    return dataLoader
      .get('recentIntegrationSearchQueries')
      .load({teamId, userId, providerId: auth.providerId})
  }
}

export default IntegrationService
