import {gitlabIntegrationMeta} from 'parabol-client/shared/integrations/gitlabIntegrationMeta'
import fetchGitLabProjects from '../../graphql/queries/helpers/fetchGitLabProjects'
import type {GitLabProject} from '../platform/RemoteRepoIntegration'
import {
  type EstimatePushCapability,
  type IssueCreateCapability,
  type IssueReadCapability,
  type RepoListCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import describeGitLabDimensionField from './describeGitLabDimensionField'
import GitLabServerManager from './GitLabServerManager'
import listGitLabDimensionFields from './listGitLabDimensionFields'
import pushEstimateToGitLab from './pushEstimateToGitLab'
import resolveGitLabDimensionFieldKey from './resolveGitLabDimensionFieldKey'
import resolveGitLabTaskIntegration from './resolveGitLabTaskIntegration'

export class GitLabServerIntegration extends ServerIntegrationDefinition {
  readonly service = gitlabIntegrationMeta.service
  readonly title = gitlabIntegrationMeta.title
  readonly authStrategy = 'oauth2' as const

  readonly capabilities: {
    issueCreate: IssueCreateCapability
    issueRead: IssueReadCapability
    repoList: RepoListCapability<GitLabProject>
    estimatePush: EstimatePushCapability
  } = {
    issueCreate: {
      initManager: async (ctx) => {
        const auth = await this.resolveAuth(ctx)
        if (!auth) return null
        const provider = await ctx.dataLoader.get('integrationProviders').load(auth.providerId)
        if (!provider?.serverBaseUrl) return null
        return new GitLabServerManager(auth, ctx.context, ctx.info, provider.serverBaseUrl)
      }
    },
    issueRead: {getIssue: resolveGitLabTaskIntegration},
    repoList: {
      fetchRepos: ({teamId, userId, context, info}) =>
        fetchGitLabProjects(teamId, userId, context, info),
      vendorRepo: {
        typename: () => '_xGitLabProject',
        name: ({fullPath}) => fullPath
      }
    },
    estimatePush: {
      targets: ['comment', 'label'],
      pushEstimate: pushEstimateToGitLab,
      resolveDimensionFieldKey: resolveGitLabDimensionFieldKey,
      describeDimensionField: describeGitLabDimensionField,
      listDimensionFields: listGitLabDimensionFields
    }
  }
}
