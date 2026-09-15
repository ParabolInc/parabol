import type {RepoIntegrationResolvers} from '../resolverTypes'

const TYPENAME_BY_SERVICE = {
  azureDevOps: 'AzureDevOpsRemoteProject',
  github: 'RepoContainer',
  gitlab: 'RepoContainer',
  jira: 'JiraRemoteProject',
  jiraServer: 'JiraServerRemoteProject',
  linear: 'RepoContainer'
} as const

const RepoIntegration: RepoIntegrationResolvers = {
  __resolveType: ({service}) => TYPENAME_BY_SERVICE[service]
}

export default RepoIntegration
