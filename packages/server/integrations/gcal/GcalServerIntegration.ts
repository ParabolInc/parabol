import {gcalIntegrationMeta} from 'parabol-client/shared/integrations/gcalIntegrationMeta'
import type {TIntegrationProvider} from '../../postgres/types/IntegrationProvider'
import {
  type IntegrationCtx,
  type ServerIntegrationCapabilities,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'

export class GcalServerIntegration extends ServerIntegrationDefinition {
  readonly service = gcalIntegrationMeta.service
  readonly title = gcalIntegrationMeta.title
  readonly authStrategy = 'oauth2' as const
  readonly capabilities: ServerIntegrationCapabilities = {}

  async isAvailable(ctx: IntegrationCtx) {
    return !!(await this.getGlobalProvider(ctx))
  }

  async getSharedProviders(): Promise<TIntegrationProvider[]> {
    return []
  }
}
