import type {RepoIntegrationResolvers} from '../resolverTypes'

const RepoIntegration: RepoIntegrationResolvers = {
  __resolveType: (repo) => {
    switch (repo.service) {
      case 'jira':
        return 'JiraRemoteProject'
      case 'jiraServer':
        return 'JiraServerRemoteProject'
      case 'azureDevOps':
        return 'AzureDevOpsRemoteProject'
      case 'github':
        return '_xGitHubRepository'
      case 'gitlab':
        return '_xGitLabProject'
      case 'linear':
        return repo.id === repo.teamId ? '_xLinearTeam' : 'LinearRemoteProject'
    }
  }
}

export default RepoIntegration
