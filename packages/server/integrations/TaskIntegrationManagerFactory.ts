import {GraphQLResolveInfo} from 'graphql'
import {IntegrationProviderServiceEnumType} from '../graphql/types/IntegrationProviderServiceEnum'
import JiraTaskIntegrationManager from './JiraTaskIntegrationManager'
import GitHubTaskIntegrationManager from './GitHubTaskIntegrationManager'
import {DataLoaderWorker, GQLContext} from '../graphql/graphql'
import {IntegrationProviderJiraServer} from '../postgres/queries/getIntegrationProvidersByIds'
import {TaskIntegration} from '../database/types/Task'
import JiraServerRestManager from './jiraServer/JiraServerRestManager'

export type CreateTaskResponse =
  | {
      integrationHash: string
      // TODO: include issueId for GitHub in hash or store integration.issueId for all integrations
      // See https://github.com/ParabolInc/parabol/issues/6252
      issueId: string
      integration: TaskIntegration
    }
  | Error

export interface TaskIntegrationManager {
  title: string

  createTask(params: {
    rawContentStr: string
    integrationRepoId: string
    context?: GQLContext
    info?: GraphQLResolveInfo
  }): Promise<CreateTaskResponse>

  addCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string,
    issueId: string
  ): Promise<string | Error>
}

export default class TaskIntegrationManagerFactory {
  public static async initManager(
    dataLoader: DataLoaderWorker,
    service: IntegrationProviderServiceEnumType,
    {teamId, userId}: {teamId: string; userId: string},
    context: GQLContext,
    info: GraphQLResolveInfo
  ): Promise<
    JiraTaskIntegrationManager | GitHubTaskIntegrationManager | JiraServerRestManager | null
  > {
    if (service === 'jira') {
      const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
      return auth && new JiraTaskIntegrationManager(auth)
    }

    if (service === 'github') {
      const auth = await dataLoader.get('githubAuth').load({teamId, userId})
      return auth && new GitHubTaskIntegrationManager(auth, context, info)
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

      return new JiraServerRestManager(auth, provider as IntegrationProviderJiraServer)
    }

    return null
  }
}
