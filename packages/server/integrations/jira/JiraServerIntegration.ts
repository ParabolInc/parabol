import {jiraIntegrationMeta} from 'parabol-client/shared/integrations/jiraIntegrationMeta'
import {
  type IntegrationAuth,
  type IntegrationCtx,
  type IssueCreateCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import TaskIntegrationManagerFactory from '../TaskIntegrationManagerFactory'

export class JiraServerIntegration extends ServerIntegrationDefinition {
  readonly service = jiraIntegrationMeta.service
  readonly title = jiraIntegrationMeta.title
  readonly authStrategy = 'oauth2' as const

  async resolveAuth(ctx: IntegrationCtx): Promise<IntegrationAuth | null> {
    const {dataLoader, teamId, userId} = ctx
    const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
    if (!auth?.accessToken) return null
    return {
      accessToken: auth.accessToken,
      accessUserId: auth.userId,
      providerId: auth.providerId,
      raw: auth
    }
  }

  async isAvailable(ctx: IntegrationCtx) {
    return this.hasGlobalProvider(ctx, 'jira')
  }

  async isConnected(ctx: IntegrationCtx) {
    return this.hasActiveAuthRow(ctx, 'jira')
  }

  readonly capabilities: {issueCreate: IssueCreateCapability} = {
    issueCreate: {
      initManager: (ctx) =>
        TaskIntegrationManagerFactory.initManager(
          ctx.dataLoader,
          'jira',
          {teamId: ctx.teamId, userId: ctx.userId},
          ctx.context,
          ctx.info
        )
    }
  }
}
