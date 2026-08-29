import {linearIntegrationMeta} from 'parabol-client/shared/integrations/linearIntegrationMeta'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'
import {
  type IntegrationCtx,
  type IssueCreateCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import TaskIntegrationManagerFactory from '../TaskIntegrationManagerFactory'

export class LinearServerIntegration extends ServerIntegrationDefinition {
  readonly service = linearIntegrationMeta.service
  readonly title = linearIntegrationMeta.title
  readonly authStrategy = 'oauth2' as const

  async resolveAuth(ctx: IntegrationCtx): Promise<TeamMemberIntegrationAuth | null> {
    const {dataLoader, teamId, userId} = ctx
    const auth = await dataLoader.get('freshLinearAuth').load({teamId, userId})
    return auth?.accessToken ? auth : null
  }

  async isAvailable(ctx: IntegrationCtx) {
    return this.hasSharedProvider(ctx, 'linear')
  }

  async isConnected(ctx: IntegrationCtx) {
    return this.hasActiveAuthRow(ctx, 'linear')
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
