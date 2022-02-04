import {DeepPartial} from 'rethinkdb-ts/lib/internal-types'
import {GraphQLResolveInfo} from 'graphql'
import {IntegrationProviderServiceEnumType} from '../graphql/types/IntegrationProviderServiceEnum'
import JiraTaskIntegrationManager from './JiraTaskIntegrationManager'
import GitHubTaskIntegrationManager from './GitHubTaskIntegrationManager'
import {RValue} from '../database/stricterR'
import Task from '../database/types/Task'
import {Doc} from '../utils/convertContentStateToADF'
import {DataLoaderWorker, GQLContext} from '../graphql/graphql'

export type CreateTaskResponse = {
  error?: {
    message: string
  }
  integrationData?: RValue<DeepPartial<Task>>
}

export interface TaskIntegrationManager {
  title: string

  createTask(params: {
    accessUserId: string
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
  ): Promise<TaskIntegrationManager | undefined | null> {
    let auth
    let manager

    if (service === 'jira') {
      auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
      manager = new JiraTaskIntegrationManager(auth)
    }

    if (service === 'github') {
      auth = await dataLoader.get('githubAuth').load({teamId, userId})
      manager = new GitHubTaskIntegrationManager(auth)
    }

    if (!auth) {
      return null
    }

    return manager
  }
}
