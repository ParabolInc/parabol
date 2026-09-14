import GitLabIssueId from 'parabol-client/shared/gqlIds/GitLabIssueId'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import {gitlabIntegrationMeta} from 'parabol-client/shared/integrations/gitlabIntegrationMeta'
import fetchGitLabProjects from '../../graphql/queries/helpers/fetchGitLabProjects'
import type {GitLabProject} from '../platform/RemoteRepoIntegration'
import {
  type EstimatePushCapability,
  type GqlIntegrationCtx,
  type IssueCreateCapability,
  type IssueReadCapability,
  type IssueRef,
  type RepoListCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import describeGitLabDimensionField from './describeGitLabDimensionField'
import GitLabServerManager from './GitLabServerManager'
import listGitLabDimensionFields from './listGitLabDimensionFields'
import pushEstimateToGitLab from './pushEstimateToGitLab'
import resolveGitLabDimensionFieldKey from './resolveGitLabDimensionFieldKey'
import resolveGitLabTaskIntegration from './resolveGitLabTaskIntegration'

const parseIssueHashGid = (hash: string) => {
  const {providerId, gid} = GitLabIssueId.split(hash)
  if (!gid?.startsWith('gid://')) return null
  return GitLabIssueId.join(providerId, gid) === hash ? gid : null
}

export class GitLabServerIntegration extends ServerIntegrationDefinition {
  readonly service = gitlabIntegrationMeta.service
  readonly title = gitlabIntegrationMeta.title
  readonly authStrategy = 'oauth2' as const

  async resolveIssue(ctx: GqlIntegrationCtx, id: string): Promise<IssueRef | null> {
    const isBareGid = id.startsWith('gid://') && !id.includes('::')
    const gid = isBareGid ? id : parseIssueHashGid(id)
    if (!gid) return null
    const auth = await this.resolveAuth(ctx)
    if (!auth) return null
    const providerId = IntegrationProviderId.join(auth.providerId)
    return {
      integrationHash: GitLabIssueId.join(providerId, gid),
      integration: {accessUserId: ctx.userId, service: 'gitlab' as const, providerId, gid}
    }
  }

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
      integrationRepoId: ({fullPath}) => fullPath,
      name: ({fullPath}) => fullPath
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
