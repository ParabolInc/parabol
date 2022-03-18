import {IntegrationProviderServiceEnumType} from '../graphql/types/IntegrationProviderServiceEnum'
import JiraTaskIntegrationManager from './JiraTaskIntegrationManager'
import GitHubTaskIntegrationManager from './GitHubTaskIntegrationManager'
import JiraServerTaskIntegrationManager from './JiraServerTaskIntegrationManager'
import {DataLoaderWorker} from '../graphql/graphql'
import {IntegrationProviderJiraServer} from '../postgres/queries/getIntegrationProvidersByIds'

export default class TaskIntegrationManagerFactory {
  public static async initManager(
    dataLoader: DataLoaderWorker,
    service: IntegrationProviderServiceEnumType,
    {teamId, userId}: {teamId: string; userId: string}
  ): Promise<
    | JiraTaskIntegrationManager
    | GitHubTaskIntegrationManager
    | JiraServerTaskIntegrationManager
    | null
  > {
    if (service === 'jira') {
      const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
      return auth && new JiraTaskIntegrationManager(auth)
    }

    if (service === 'github') {
      const auth = await dataLoader.get('githubAuth').load({teamId, userId})
      return auth && new GitHubTaskIntegrationManager(auth)
    }

    if (service === 'jiraServer') {
      const auth = await dataLoader
        .get('teamMemberIntegrationAuths')
        .load({service: 'jiraServer', teamId, userId})

      if (!auth) {
        return null
      }
      const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)

      if (!provider) {
        return null
      }

      return new JiraServerTaskIntegrationManager(auth, provider as IntegrationProviderJiraServer)
    }

    return null
  }
}
