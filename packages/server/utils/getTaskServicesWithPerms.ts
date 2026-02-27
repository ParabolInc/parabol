import type {DataLoaderWorker} from '../graphql/graphql'
import type {IntegrationProviderServiceEnumType} from '../integrations/TaskIntegrationManagerFactory'

const getTaskServicesWithPerms = async (
  dataLoader: DataLoaderWorker,
  teamId: string,
  userId: string
) => {
  const [atlassianAuth, githubAuth, gitlabAuth, azureAuth, jiraServerAuth] = await Promise.all([
    dataLoader.get('freshAtlassianAuth').load({teamId, userId}),
    dataLoader.get('githubAuth').load({teamId, userId}),
    dataLoader.get('freshGitlabAuth').load({teamId, userId}),
    dataLoader.get('freshAzureDevOpsAuth').load({teamId, userId}),
    dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'jiraServer', teamId, userId})
  ])
  const allPossibleTaskServices: IntegrationProviderServiceEnumType[] = [
    'jira',
    'github',
    'gitlab',
    'azureDevOps',
    'jiraServer'
  ]
  return allPossibleTaskServices.filter((service) => {
    switch (service) {
      case 'jira':
        return !!atlassianAuth
      case 'github':
        return !!githubAuth
      case 'gitlab':
        return !!gitlabAuth
      case 'azureDevOps':
        return !!azureAuth
      case 'jiraServer':
        return !!jiraServerAuth
      default:
        return false
    }
  })
}

export default getTaskServicesWithPerms
