import {githubIntegrationMeta} from 'parabol-client/shared/integrations/githubIntegrationMeta'
import type {GitHubSearchQueryJson, TeamMemberIntegrationAuth} from '../../postgres/types'
import {
  type IntegrationCtx,
  type IssueCreateCapability,
  type IssueSearchCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import TaskIntegrationManagerFactory from '../TaskIntegrationManagerFactory'
import buildGitHubSearchQuery from './buildGitHubSearchQuery'

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
    return this.hasSharedProvider(ctx, 'github')
  }

  async isConnected(ctx: IntegrationCtx) {
    return this.hasActiveAuthRow(ctx, 'github')
  }

  readonly capabilities: {
    issueCreate: IssueCreateCapability
    issueSearch: IssueSearchCapability<GitHubSearchQueryJson>
  } = {
    issueCreate: {
      initManager: (ctx) =>
        TaskIntegrationManagerFactory.initManager(
          ctx.dataLoader,
          'github',
          {teamId: ctx.teamId, userId: ctx.userId},
          ctx.context,
          ctx.info
        )
    },
    issueSearch: {buildQuery: buildGitHubSearchQuery}
  }
}
