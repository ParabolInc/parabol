import type {ComponentType} from 'react'
import type Atmosphere from '../../Atmosphere'
import type {MenuMutationProps} from '../../hooks/useMutationProps'
import type {IntegrationIdCodec, IntegrationMeta} from '../../shared/integrations/IntegrationMeta'

export interface ConnectProvider {
  id: string
  clientId: string
  serverBaseUrl: string
  tenantId: string | null
}

/** A provider as the IntegrationService interface returns it; OAuth1 rows carry no clientId */
export interface ConnectProviderRef {
  id: string
  clientId: string | null
  serverBaseUrl: string | null
  tenantId: string | null
}

export interface ConnectParams {
  teamId: string
  mutationProps: MenuMutationProps
  provider?: ConnectProviderRef
  /** Scopes the viewer already holds on this provider; services with incremental consent (Jira today) request the union */
  heldScopes?: readonly string[] | null
}

export abstract class ClientIntegrationDefinition {
  abstract readonly service: IntegrationMeta['service']
  abstract readonly title: string
  abstract readonly description: string
  abstract readonly ids: IntegrationIdCodec
  abstract readonly Icon: ComponentType<{className?: string}>
  readonly iconClassName?: string
  abstract connect(atmosphere: Atmosphere, params: ConnectParams): void
}
