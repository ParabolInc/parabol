import {githubIntegrationMeta} from 'parabol-client/shared/integrations/githubIntegrationMeta'
import fetchGitHubRepos from '../../graphql/queries/helpers/fetchGitHubRepos'
import type {GitHubSearchQueryJson, TeamMemberIntegrationAuth} from '../../postgres/types'
import {
  type EstimatePushCapability,
  type IntegrationCtx,
  type IssueCreateCapability,
  type IssueReadCapability,
  type IssueSearchCapability,
  type RepoListCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import buildGitHubSearchQuery from './buildGitHubSearchQuery'
import describeGitHubDimensionField from './describeGitHubDimensionField'
import GitHubServerManager from './GitHubServerManager'
import pushEstimateToGitHub from './pushEstimateToGitHub'
import resolveGitHubDimensionFieldKey from './resolveGitHubDimensionFieldKey'
import resolveGitHubTaskIntegration from './resolveGitHubTaskIntegration'

export class GitHubServerIntegration extends ServerIntegrationDefinition {
  readonly service = githubIntegrationMeta.service
  readonly title = githubIntegrationMeta.title
  readonly authStrategy = 'oauth2' as const

  async resolveAuth(ctx: IntegrationCtx): Promise<TeamMemberIntegrationAuth | null> {
    const {dataLoader, teamId, userId} = ctx
    const auth = await dataLoader.get('githubAuth').load({teamId, userId})
    return auth?.accessToken ? auth : null
  }

  async isAvailable(ctx: IntegrationCtx) {
    return !!(await this.getGlobalProvider(ctx))
  }

  readonly capabilities: {
    issueCreate: IssueCreateCapability
    issueRead: IssueReadCapability
    issueSearch: IssueSearchCapability<GitHubSearchQueryJson>
    repoList: RepoListCapability
    estimatePush: EstimatePushCapability
  } = {
    issueCreate: {
      initManager: async ({dataLoader, teamId, userId, context, info}) => {
        const auth = await dataLoader.get('githubAuth').load({teamId, userId})
        return auth ? new GitHubServerManager(auth, context, info) : null
      }
    },
    issueRead: {getIssue: resolveGitHubTaskIntegration},
    issueSearch: {buildQuery: buildGitHubSearchQuery, persistQueries: true},
    repoList: {
      fetchRepos: ({dataLoader, teamId, userId, context, info}) =>
        fetchGitHubRepos(teamId, userId, dataLoader, context, info)
    },
    estimatePush: {
      targets: ['comment', 'label'],
      pushEstimate: pushEstimateToGitHub,
      resolveDimensionFieldKey: resolveGitHubDimensionFieldKey,
      describeDimensionField: describeGitHubDimensionField
    }
  }
}
