import {jiraServerIntegrationMeta} from 'parabol-client/shared/integrations/jiraServerIntegrationMeta'
import {
  type IntegrationAuth,
  type IntegrationCtx,
  type IssueCreateCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import TaskIntegrationManagerFactory from '../TaskIntegrationManagerFactory'

export class JiraServerServerIntegration extends ServerIntegrationDefinition {
  readonly service = jiraServerIntegrationMeta.service
  readonly title = jiraServerIntegrationMeta.title
  readonly authStrategy = 'oauth1' as const

  async resolveAuth(ctx: IntegrationCtx): Promise<IntegrationAuth | null> {
    const {dataLoader, teamId, userId} = ctx
    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'jiraServer', teamId, userId})
    if (!auth?.accessToken) return null
    return {
      accessToken: auth.accessToken,
      accessUserId: auth.userId,
      providerId: auth.providerId,
      raw: auth
    }
  }

  async isAvailable(ctx: IntegrationCtx) {
    return this.hasSharedProvider(ctx, 'jiraServer')
  }

  async isConnected(ctx: IntegrationCtx) {
    return this.hasActiveAuthRow(ctx, 'jiraServer')
  }

  readonly capabilities: {issueCreate: IssueCreateCapability} = {
    issueCreate: {
      initManager: (ctx) =>
        TaskIntegrationManagerFactory.initManager(
          ctx.dataLoader,
          'jiraServer',
          {teamId: ctx.teamId, userId: ctx.userId},
          ctx.context,
          ctx.info
        )
    }
  }
}
