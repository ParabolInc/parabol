import {GraphQLResolveInfo} from 'graphql'
import {IntegrationProviderServiceEnumType} from '../graphql/types/IntegrationProviderServiceEnum'
import JiraTaskIntegrationManager from './JiraTaskIntegrationManager'
import GitHubTaskIntegrationManager from './GitHubTaskIntegrationManager'
import {TaskIntegration} from '../database/types/Task'
import {Doc} from '../utils/convertContentStateToADF'
import {DataLoaderWorker, GQLContext} from '../graphql/graphql'

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
    projectId: string
    createdBySomeoneElseComment?: Doc | string
    context?: GQLContext
    info?: GraphQLResolveInfo
  }): Promise<CreateTaskResponse>

  // TODO: implement addCreatedBySomeoneElseComment instead
  getCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string
  ): Doc | string
}

export default class TaskIntegrationManagerFactory {
  public static async initManager(
    dataLoader: DataLoaderWorker,
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

    return null
  }
}
