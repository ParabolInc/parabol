import {DeepPartial} from 'rethinkdb-ts/lib/internal-types'
import {GraphQLResolveInfo} from 'graphql'
import {IntegrationProviderServiceEnumType} from '../graphql/types/IntegrationProviderServiceEnum'
import JiraTaskIntegrationManager from './JiraTaskIntegrationManager'
import GitHubTaskIntegrationManager from './GitHubTaskIntegrationManager'
import Task from '../database/types/Task'
import {Doc} from '../utils/convertContentStateToADF'
import {DataLoaderWorker, GQLContext} from '../graphql/graphql'

export type CreateTaskResponse =
  | DeepPartial<Task>
  | {
      error: {
        message: string
      }
    }

export interface TaskIntegrationManager {
  title: string

  createTask(params: {
    rawContentStr: string
    projectId: string
    createdBySomeoneElseComment?: Doc | string
    context?: GQLContext
    info?: GraphQLResolveInfo
  }): Promise<CreateTaskResponse>

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
