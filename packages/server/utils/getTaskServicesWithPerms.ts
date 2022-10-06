import {DataLoaderWorker} from '../graphql/graphql'
import IntegrationProviderServiceEnum, {
  IntegrationProviderServiceEnumType
} from '../graphql/types/IntegrationProviderServiceEnum'

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
    dataLoader.get('teamMemberIntegrationAuths').load({service: 'jiraServer', teamId, userId})
  ])
  const allPossibleTaskServices = IntegrationProviderServiceEnum.getValues().map(
    (service) => service.name
  )

  return allPossibleTaskServices.filter(
    (service): service is IntegrationProviderServiceEnumType => {
      switch (service) {
        case 'jira':
          return !!atlassianAuth
        case 'github':
          return !!githubAuth
        case 'gitlab':
          return !!gitlabAuth
        case 'azure':
          return !!azureAuth
        case 'jiraServer':
          return !!jiraServerAuth
        default:
          return false
      }
    }
  )
}

export default getTaskServicesWithPerms
