import type {ComponentType, LazyExoticComponent} from 'react'
import type {ScopePhaseArea_meeting$data} from '../../__generated__/ScopePhaseArea_meeting.graphql'
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

export interface ScopingCapability {
  /** The poker scope-tab panel. Lazy so importing the registry does not pull every panel into the main bundle */
  Panel: LazyExoticComponent<ComponentType<{meetingRef: ScopePhaseArea_meeting$data}>>
  /** Show the tab even when the team cannot use the service yet, as a pitch to contact sales */
  advertiseWhenUnavailable?: boolean
}

export interface ClientIntegrationCapabilities {
  scoping?: ScopingCapability
}

export abstract class ClientIntegrationDefinition {
  abstract readonly service: IntegrationMeta['service']
  abstract readonly title: string
  abstract readonly description: string
  abstract readonly ids: IntegrationIdCodec
  abstract readonly Icon: ComponentType<{className?: string}>
  readonly iconClassName?: string
  /** The 48px logo on the team settings row; Icon is the small inline mark for menus and tabs */
  abstract readonly ProviderLogo: ComponentType<{className?: string}>
  abstract readonly capabilities: ClientIntegrationCapabilities
  /** Where to send the viewer when the OAuth popup closes without completing */
  readonly authorizationHelpUrl?: string
  /** Shown instead of Connect when the team cannot use the service; clickEvent is the client analytics event name */
  readonly contactUs?: {url: string; clickEvent: string}
  /** Second line under the Remove menu item for services whose grant covers more than themselves */
  getDisconnectSubline?(grantedScopes: readonly string[]): string | undefined
  abstract connect(atmosphere: Atmosphere, params: ConnectParams): void
}
