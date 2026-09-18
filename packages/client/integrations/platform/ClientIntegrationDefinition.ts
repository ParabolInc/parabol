import type {ComponentType, LazyExoticComponent, ReactNode} from 'react'
import type Atmosphere from '../../Atmosphere'
import type {MenuMutationProps} from '../../hooks/useMutationProps'
import type {IntegrationMeta} from '../../shared/integrations/IntegrationMeta'
import type {LazyExoticPreload} from '../../utils/lazyPreload'
import type {IntegrationSearchFilter} from './IntegrationSearchFilter'
import type {
  FilterMenuProps,
  NewRecordInputProps,
  ScopingResultsProps,
  ScopingSearchContext,
  ScopingSearchState,
  SearchMetaCodec
} from './ScopingSearchState'

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

/** One of the viewer's saved searches for a service, in the normalized shape the host renders */
export interface ScopingSavedQuery {
  id: string
  queryString: string
  isAdvancedQuery: boolean
  filters: readonly IntegrationSearchFilter[]
}

/** Everything IntegrationScopingPanel needs to run one service's scope tab */
export interface ScopingCapability extends SearchMetaCodec {
  /** Runs the service's own results query for the search state and renders the host's list with the normalized items; build it with makeScopingResults */
  Results: ComponentType<ScopingResultsProps>
  /** Omit for a service with nothing to filter by; the host then hides the filter button */
  FilterMenu?: LazyExoticPreload<ComponentType<FilterMenuProps>>
  /** Omit for a service that cannot create a record from the panel; the host then hides the new-record button */
  NewRecordInput?: LazyExoticComponent<ComponentType<NewRecordInputProps>>
  placeholder(state: ScopingSearchState): string
  /** The "Current filters:" line; a ReactNode so a service can suspend on its own data */
  currentFilters?(state: ScopingSearchState, context: ScopingSearchContext): ReactNode
  /** What the search history shows for a saved filter; absent when the value is already readable */
  filterChipLabel?(filter: IntegrationSearchFilter): string
  /** What the search history shows for a saved query; defaults to quoting a plain search */
  savedQueryLabel?(savedQuery: ScopingSavedQuery): string
  /** How the service's server integration normalizes a queryString before storing it, so the host can spot an already saved search */
  normalizeQueryString?(queryString: string): string
  /** A client-side rejection of the query before the vendor sees it, shown in place of results */
  validate?(state: ScopingSearchState): string | undefined
  /** Omit for a service with no select-all row; the noun labels it, e.g. "Select all 12 issues" */
  selectAllNoun?: string
  /** What the new-record button says; defaults to New Issue */
  newRecordLabel?: string
  /** Seeds an untouched search box on mount */
  defaultQueryString?(savedQueries: readonly ScopingSavedQuery[]): string | undefined
  /** A query the service seeds itself is not worth saving to the viewer's history */
  isDefaultQuery?(state: ScopingSearchState): boolean
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
