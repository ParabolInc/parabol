import type Atmosphere from '../../Atmosphere'
import type {MenuMutationProps} from '../../hooks/useMutationProps'
import type {IntegrationIdCodec, IntegrationMeta} from '../../shared/integrations/IntegrationMeta'

export interface ConnectProvider {
  id: string
  clientId: string
  serverBaseUrl: string
  tenantId: string | null
}

export interface ConnectParams {
  teamId: string
  mutationProps: MenuMutationProps
  provider?: ConnectProvider
}

export abstract class ClientIntegrationDefinition {
  abstract readonly service: IntegrationMeta['service']
  abstract readonly title: string
  abstract readonly description: string
  abstract readonly ids: IntegrationIdCodec
  abstract connect(atmosphere: Atmosphere, params: ConnectParams): void
}
