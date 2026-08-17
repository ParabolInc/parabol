import {gitlabIntegrationMeta} from 'parabol-client/shared/integrations/gitlabIntegrationMeta'
import {
  type IntegrationAuth,
  type IntegrationCtx,
  type IssueCreateCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import TaskIntegrationManagerFactory from '../TaskIntegrationManagerFactory'

export class GitLabServerIntegration extends ServerIntegrationDefinition {
  readonly service = gitlabIntegrationMeta.service
  readonly title = gitlabIntegrationMeta.title
  readonly authStrategy = 'oauth2' as const

  async resolveAuth(ctx: IntegrationCtx): Promise<IntegrationAuth | null> {
    const {dataLoader, teamId, userId} = ctx
    const auth = await dataLoader.get('freshGitlabAuth').load({teamId, userId})
    if (!auth?.accessToken) return null
    return {
      accessToken: auth.accessToken,
      accessUserId: auth.userId,
      providerId: auth.providerId,
      raw: auth
    }
  }

  readonly capabilities: {issueCreate: IssueCreateCapability} = {
    issueCreate: {
      initManager: (ctx) =>
        TaskIntegrationManagerFactory.initManager(
          ctx.dataLoader,
          'gitlab',
          {teamId: ctx.teamId, userId: ctx.userId},
          ctx.context,
          ctx.info
        )
    }
  }
}
