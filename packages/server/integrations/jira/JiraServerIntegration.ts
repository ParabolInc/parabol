import {jiraIntegrationMeta} from 'parabol-client/shared/integrations/jiraIntegrationMeta'
import type {
  AtlassianAuth,
  JiraSearchQueryJson,
  TeamMemberIntegrationAuth
} from '../../postgres/types'
import {hasJiraScopes} from '../../utils/hasJiraScopes'
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
import describeJiraDimensionField from './describeJiraDimensionField'
import fetchJiraProjects from './fetchJiraProjects'
import JiraIntegrationManager from './JiraIntegrationManager'
import listJiraDimensionFields from './listJiraDimensionFields'
import pushEstimateToJira from './pushEstimateToJira'
import resolveJiraDimensionFieldKey from './resolveJiraDimensionFieldKey'
import resolveJiraTaskIntegration from './resolveJiraTaskIntegration'

export class JiraServerIntegration extends ServerIntegrationDefinition {
  readonly service = jiraIntegrationMeta.service
  readonly title = jiraIntegrationMeta.title
  readonly authStrategy = 'oauth2' as const

  /** An Atlassian grant may be Confluence-only; it is usable for Jira only with the Jira scopes */
  async resolveAuth(ctx: IntegrationCtx): Promise<AtlassianAuth | null> {
    const {dataLoader, teamId, userId} = ctx
    const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
    return auth?.accessToken && hasJiraScopes(auth.scope) ? auth : null
  }

  async isAvailable(ctx: IntegrationCtx) {
    return !!(await this.getGlobalProvider(ctx))
  }

  async getAuthRow(ctx: IntegrationCtx): Promise<TeamMemberIntegrationAuth | null> {
    const auth = await super.getAuthRow(ctx)
    return auth && hasJiraScopes(auth.scopes) ? auth : null
  }

  readonly capabilities: {
    issueCreate: IssueCreateCapability
    issueRead: IssueReadCapability
    issueSearch: IssueSearchCapability<JiraSearchQueryJson>
    repoList: RepoListCapability
    estimatePush: EstimatePushCapability
  } = {
    issueCreate: {
      initManager: async (ctx) => {
        const auth = await this.resolveAuth(ctx)
        return auth && new JiraIntegrationManager(auth)
      }
    },
    issueRead: {getIssue: resolveJiraTaskIntegration},
    issueSearch: {buildQuery: buildJiraSearchQuery},
    repoList: {fetchRepos: fetchJiraProjects},
    estimatePush: {
      targets: ['comment', 'field'],
      pushEstimate: pushEstimateToJira,
      resolveDimensionFieldKey: resolveJiraDimensionFieldKey,
      describeDimensionField: describeJiraDimensionField,
      listDimensionFields: listJiraDimensionFields
    }
  }
}
