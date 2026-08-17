import {linearIntegrationMeta} from 'parabol-client/shared/integrations/linearIntegrationMeta'
import {
  type IntegrationAuth,
  type IntegrationCtx,
  type IssueCreateCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import TaskIntegrationManagerFactory from '../TaskIntegrationManagerFactory'

export class LinearServerIntegration extends ServerIntegrationDefinition {
  readonly service = linearIntegrationMeta.service
  readonly title = linearIntegrationMeta.title
  readonly authStrategy = 'oauth2' as const

  async resolveAuth(ctx: IntegrationCtx): Promise<IntegrationAuth | null> {
    const {dataLoader, teamId, userId} = ctx
    const auth = await dataLoader.get('freshLinearAuth').load({teamId, userId})
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
          'linear',
          {teamId: ctx.teamId, userId: ctx.userId},
          ctx.context,
          ctx.info
        )
    }
  }
}
