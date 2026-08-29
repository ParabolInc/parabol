import {jiraServerIntegrationMeta} from 'parabol-client/shared/integrations/jiraServerIntegrationMeta'
import type {JiraSearchQueryJson} from '../../postgres/types'
import buildJiraSearchQuery from '../jira/buildJiraSearchQuery'
import {
  type EstimatePushCapability,
  type IssueCreateCapability,
  type IssueReadCapability,
  type IssueSearchCapability,
  type RepoListCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import describeJiraServerDimensionField from './describeJiraServerDimensionField'
import fetchJiraServerProjects from './fetchJiraServerProjects'
import JiraServerRestManager from './JiraServerRestManager'
import listJiraServerDimensionFields from './listJiraServerDimensionFields'
import pushEstimateToJiraServer from './pushEstimateToJiraServer'
import resolveJiraServerDimensionFieldKey from './resolveJiraServerDimensionFieldKey'
import resolveJiraServerTaskIntegration from './resolveJiraServerTaskIntegration'

export class JiraServerServerIntegration extends ServerIntegrationDefinition {
  readonly service = jiraServerIntegrationMeta.service
  readonly title = jiraServerIntegrationMeta.title
  readonly authStrategy = 'oauth1' as const

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
        if (!auth) return null
        const provider = await ctx.dataLoader
          .get('integrationProviders')
          .loadNonNull(auth.providerId)
        if (provider.service !== 'jiraServer') return null
        return new JiraServerRestManager(auth, provider)
      }
    },
    issueRead: {getIssue: resolveJiraServerTaskIntegration},
    issueSearch: {buildQuery: buildJiraSearchQuery},
    repoList: {fetchRepos: fetchJiraServerProjects},
    estimatePush: {
      targets: ['comment', 'field'],
      pushEstimate: pushEstimateToJiraServer,
      resolveDimensionFieldKey: resolveJiraServerDimensionFieldKey,
      describeDimensionField: describeJiraServerDimensionField,
      listDimensionFields: listJiraServerDimensionFields
    }
  }
}
