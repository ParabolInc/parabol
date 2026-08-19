import {
  getServerIntegration,
  type RegisteredServerIntegration
} from '../../../integrations/platform/registry'
import type {IntegrationCapabilityKey} from '../../../integrations/platform/ServerIntegrationDefinition'
import type {TeamIntegrationResolvers} from '../resolverTypes'

export type TeamIntegrationSource = {
  service: RegisteredServerIntegration
  title: string
  capabilities: IntegrationCapabilityKey[]
  teamId: string
  userId: string
}

const TYPENAME_BY_SERVICE = {
  azureDevOps: 'AzureDevOpsTeamIntegration',
  github: 'GitHubTeamIntegration',
  gitlab: 'GitLabTeamIntegration',
  jira: 'JiraTeamIntegration',
  jiraServer: 'JiraServerTeamIntegration',
  linear: 'LinearTeamIntegration'
} as const

const TeamIntegration: TeamIntegrationResolvers = {
  __resolveType: ({service}) => TYPENAME_BY_SERVICE[service],
  isAvailable: ({service, teamId, userId}, _args, {dataLoader}) =>
    getServerIntegration(service).isAvailable({dataLoader, teamId, userId}),
  isConnected: ({service, teamId, userId}, _args, {dataLoader}) =>
    getServerIntegration(service).isConnected({dataLoader, teamId, userId})
}

export default TeamIntegration
