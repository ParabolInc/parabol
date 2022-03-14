import {GraphQLResolveInfo} from 'graphql'
import {IntegrationProviderServiceEnumType} from '../graphql/types/IntegrationProviderServiceEnum'
import JiraTaskIntegrationManager from './JiraTaskIntegrationManager'
import GitHubTaskIntegrationManager from './GitHubTaskIntegrationManager'
import JiraServerTaskIntegrationManager from './JiraServerTaskIntegrationManager'
import {TaskIntegration} from '../database/types/Task'
import {Doc} from '../utils/convertContentStateToADF'
import {DataLoaderWorker, GQLContext} from '../graphql/graphql'
import RootDataLoader from '../dataloader/RootDataLoader'

export type CreateTaskResponse =
  | {
      integrationHash: string
      integration: TaskIntegration
    }
  | Error

export interface TaskIntegrationManager {
  title: string

  createTask(params: {
    rawContentStr: string
    integrationRepoId: string
    createdBySomeoneElseComment?: Doc | string
    context?: GQLContext
    info?: GraphQLResolveInfo
  }): Promise<CreateTaskResponse>

  // TODO: replace with addCreatedBySomeoneElseComment everywhere
  getCreatedBySomeoneElseComment?(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string
  ): Doc | string

  addCreatedBySomeoneElseComment?(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string,
    integrationHash: string
  )

  getIssue?(taskId: string)

  getApiManager?()
}

export default class TaskIntegrationManagerFactory {
  public static async initManager(
    dataLoader: DataLoaderWorker | RootDataLoader,
    service: IntegrationProviderServiceEnumType,
    {teamId, userId}: {teamId: string; userId: string}
  ): Promise<TaskIntegrationManager | null> {
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

      return auth && provider && new JiraServerTaskIntegrationManager(auth, provider)
    }

    return null
  }
}
