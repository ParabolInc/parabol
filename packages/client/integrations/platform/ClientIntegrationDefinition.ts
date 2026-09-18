import type {ComponentType, LazyExoticComponent} from 'react'
import type {ScopePhaseArea_meeting$data} from '../../__generated__/ScopePhaseArea_meeting.graphql'
import type Atmosphere from '../../Atmosphere'
import type {MenuMutationProps} from '../../hooks/useMutationProps'
import type {IntegrationMeta} from '../../shared/integrations/IntegrationMeta'

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
  /** What the search history shows for a saved project filter id; absent when the id is already readable */
  projectFilterLabel?(filter: string): string
}

export interface SettingsCapability {
  /** Second line under the Remove menu item for services whose grant covers more than themselves */
  getDisconnectSubline(grantedScopes: readonly string[]): string | undefined
}

/** Behavior a single surface owns; a service fact that several surfaces read stays flat on the definition */
export interface ClientIntegrationCapabilities {
  scoping?: ScopingCapability
  settings?: SettingsCapability
}

/** The brand art for the 48px settings row; darkSrc is only for marks that vanish on a dark surface */
export interface ProviderLogoAsset {
  src: string
  darkSrc?: string
}

export abstract class ClientIntegrationDefinition {
  abstract readonly service: IntegrationMeta['service']
  abstract readonly title: string
  abstract readonly description: string
  abstract readonly Icon: ComponentType<{className?: string}>
  readonly iconClassName?: string
  /** Brand art for the settings row; Icon is the small inline mark for menus and tabs */
  abstract readonly logo: ProviderLogoAsset
  abstract readonly capabilities: ClientIntegrationCapabilities
  /** Where to send the viewer when the OAuth popup closes without completing */
  readonly authorizationHelpUrl?: string
  /**
   * Advertises the service on the settings row and the scope tab even when the team cannot use it,
   * and points the Contact Us button at url; clickEvent is the client analytics event name
   */
  readonly contactUs?: {url: string; clickEvent: string}
  abstract connect(atmosphere: Atmosphere, params: ConnectParams): void
}
