import {DeepPartial} from 'rethinkdb-ts/lib/internal-types'
import {GraphQLResolveInfo} from 'graphql'
import {IntegrationProviderServiceEnumType} from '../graphql/types/IntegrationProviderServiceEnum'
import JiraTaskIntegrationManager from './JiraTaskIntegrationManager'
import GitHubTaskIntegrationManager from './GitHubTaskIntegrationManager'
import {Loaders} from '../dataloader/RootDataLoader'
import {RValue} from '../database/stricterR'
import Task from '../database/types/Task'
import {AtlassianAuth} from '../postgres/queries/getAtlassianAuthByUserIdTeamId'
import {Doc} from '../utils/convertContentStateToADF'
import {GQLContext} from '../graphql/graphql'
import {GitHubAuth} from '../postgres/queries/getGitHubAuthByUserIdTeamId'

export type CreateTaskResponse = {
  error?: {
    message: string
  }
  integrationData?: RValue<DeepPartial<Task>>
}

export interface TaskIntegrationManager {
  title: string
  authLoaderKey: Loaders

  createTask(params: {
    auth: AtlassianAuth | GitHubAuth
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
  public static getManager(
    service: IntegrationProviderServiceEnumType
  ): TaskIntegrationManager | undefined {
    return service === 'jira'
      ? new JiraTaskIntegrationManager()
      : service === 'github'
      ? new GitHubTaskIntegrationManager()
      : undefined
  }
}
