import {jiraIntegrationMeta} from 'parabol-client/integrations/jira/shared/jiraIntegrationMeta'
import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import type {
  AtlassianAuth,
  JiraSearchQueryJson,
  TeamMemberIntegrationAuth
} from '../../postgres/types'
import {
  type EstimatePushCapability,
  type IntegrationCtx,
  type IssueCreateCapability,
  type IssueListCapability,
  type IssueReadCapability,
  type IssueSearchCapability,
  type RepoListCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import buildJiraSearchQuery from './buildJiraSearchQuery'
import describeJiraDimensionField from './describeJiraDimensionField'
import fetchJiraProjects, {type JiraGQLProject} from './fetchJiraProjects'
import {hasJiraScopes} from './hasJiraScopes'
import JiraIntegrationManager from './JiraIntegrationManager'
import listJiraDimensionFields from './listJiraDimensionFields'
import listJiraIssues from './listJiraIssues'
import parseJiraIntegrationHash from './parseJiraIntegrationHash'
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
    return auth?.refreshToken && auth.providerUserId && hasJiraScopes(auth.scopes) ? auth : null
  }

  readonly capabilities: {
    issueCreate: IssueCreateCapability
    issueRead: IssueReadCapability
    issueSearch: IssueSearchCapability<JiraSearchQueryJson>
    repoList: RepoListCapability<JiraGQLProject>
    estimatePush: EstimatePushCapability
    issueList: IssueListCapability
  } = {
    issueCreate: {
      initManager: async (ctx) => {
        const auth = await this.resolveAuth(ctx)
        return auth && new JiraIntegrationManager(auth)
      }
    },
    issueRead: {
      getIssue: resolveJiraTaskIntegration,
      parseIntegrationHash: parseJiraIntegrationHash
    },
    issueSearch: {buildQuery: buildJiraSearchQuery},
    repoList: {
      fetchRepos: fetchJiraProjects,
      integrationRepoId: ({cloudId, key}) =>
        IntegrationRepoId.join({service: 'jira', cloudId, key}),
      name: ({name}) => name
    },
    estimatePush: {
      targets: ['comment', 'field'],
      pushEstimate: pushEstimateToJira,
      resolveDimensionFieldKey: resolveJiraDimensionFieldKey,
      describeDimensionField: describeJiraDimensionField,
      listDimensionFields: listJiraDimensionFields
    },
    issueList: {listIssues: listJiraIssues}
  }
}
