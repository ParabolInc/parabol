import type {ReactNode} from 'react'
import type {PreloadedQuery} from 'react-relay'
import type {OperationType} from 'relay-runtime'
import type {IntegrationSearchFilter} from '../../shared/integrations/IntegrationSearchFilter'

export interface ScopingSearchState {
  queryString: string
  isAdvancedQuery: boolean
  filters: readonly IntegrationSearchFilter[]
}

export type SavedSearchMeta = Pick<ScopingSearchState, 'isAdvancedQuery' | 'filters'>

/** Only a service's own client and server integrations know the keys inside its IntegrationSearchQuery.meta */
export interface SearchMetaCodec {
  /** Reads a saved search's meta JSON into the normalized state the host renders; unreadable meta is a plain search */
  parseSavedMeta(meta: string): SavedSearchMeta
  /** The meta JSON persistIntegrationSearchQuery hands to the service's issueSearch.buildQuery */
  serializeMeta(state: ScopingSearchState): string
}

export interface ScopingItem {
  serviceTaskId: string
  summary: string
  url: string
  linkText: string
  linkTitle: string
}

export interface ScopingResults {
  items: ScopingItem[]
  error?: string
  hasNext: boolean
  isLoadingNext?: boolean
  loadNext?(): void
}

/** What the host knows about the meeting it is scoping, for services that need more than the search state */
export interface ScopingSearchContext {
  meetingId: string
  teamId: string
  providerId: string
}

export interface ResultsAdapterProps<TQuery extends OperationType> {
  queryRef: PreloadedQuery<TQuery>
  context: ScopingSearchContext
  children(results: ScopingResults): ReactNode
}

export interface ScopingResultsProps {
  state: ScopingSearchState
  context: ScopingSearchContext
  children(results: ScopingResults): ReactNode
}

export interface FilterMenuProps {
  meetingId: string
  teamId: string
  state: ScopingSearchState
}

export interface NewRecordInputProps {
  isEditing: boolean
  setIsEditing(isEditing: boolean): void
  meetingId: string
  teamId: string
}
