import {jiraIntegrationMeta} from 'parabol-client/shared/integrations/jiraIntegrationMeta'
import pushEstimateToJira from '../../graphql/mutations/helpers/pushEstimateToJira'
import type {JiraSearchQueryJson, TeamMemberIntegrationAuth} from '../../postgres/types'
import {
  type EstimatePushCapability,
  type IntegrationCtx,
  type IssueCreateCapability,
  type IssueReadCapability,
  type IssueSearchCapability,
  type RepoListCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import buildJiraSearchQuery from './buildJiraSearchQuery'
import JiraIntegrationManager from './JiraIntegrationManager'
import resolveJiraServiceField from './resolveJiraServiceField'
import resolveJiraTaskIntegration from './resolveJiraTaskIntegration'

export class JiraServerIntegration extends ServerIntegrationDefinition {
  readonly service = jiraIntegrationMeta.service
  readonly title = jiraIntegrationMeta.title
  readonly authStrategy = 'oauth2' as const

  async resolveAuth(ctx: IntegrationCtx): Promise<TeamMemberIntegrationAuth | null> {
    const {dataLoader, teamId, userId} = ctx
    const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
    return auth?.accessToken ? auth : null
  }

  async isAvailable(ctx: IntegrationCtx) {
    return !!(await this.getGlobalProvider(ctx))
  }

  readonly capabilities: {
    issueCreate: IssueCreateCapability
    issueRead: IssueReadCapability
    issueSearch: IssueSearchCapability<JiraSearchQueryJson>
    repoList: RepoListCapability
    estimatePush: EstimatePushCapability
  } = {
    issueCreate: {
      initManager: async ({dataLoader, teamId, userId}) => {
        const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
        return auth && new JiraIntegrationManager(auth)
      }
    },
    issueRead: {getIssue: resolveJiraTaskIntegration},
    issueSearch: {buildQuery: buildJiraSearchQuery},
    repoList: {
      fetchRepos: ({dataLoader, teamId, userId}) =>
        dataLoader.get('allJiraProjects').load({teamId, userId})
    },
    estimatePush: {
      targets: ['comment', 'field'],
      pushEstimate: pushEstimateToJira,
      resolveServiceField: resolveJiraServiceField
    }
  }
}
