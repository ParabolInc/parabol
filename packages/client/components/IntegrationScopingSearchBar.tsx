import {Suspense} from 'react'
import type {
  ScopingCapability,
  ScopingSavedQuery
} from '../integrations/platform/ClientIntegrationDefinition'
import type {RegisteredClientIntegration} from '../integrations/platform/registry'
import type {
  ScopingSearchContext,
  ScopingSearchState
} from '../integrations/platform/ScopingSearchState'
import IntegrationScopingFilterToggle from './IntegrationScopingFilterToggle'
import IntegrationScopingHistoryToggle from './IntegrationScopingHistoryToggle'
import ScopingSearchBar from './ScopingSearchBar'
import ScopingSearchInput from './ScopingSearchInput'

interface Props {
  scoping: ScopingCapability
  service: RegisteredClientIntegration
  context: ScopingSearchContext
  state: ScopingSearchState
  savedQueries: readonly ScopingSavedQuery[]
}

const IntegrationScopingSearchBar = (props: Props) => {
  const {scoping, service, context, state, savedQueries} = props
  const {meetingId, teamId} = context
  const currentFilters = scoping.currentFilters?.(state, context)
  return (
    <ScopingSearchBar
      currentFilters={
        currentFilters ? <Suspense fallback={null}>{currentFilters}</Suspense> : undefined
      }
    >
      <IntegrationScopingHistoryToggle
        scoping={scoping}
        service={service}
        meetingId={meetingId}
        teamId={teamId}
        savedQueries={savedQueries}
      />
      <ScopingSearchInput
        placeholder={scoping.placeholder(state)}
        queryString={state.queryString}
        meetingId={meetingId}
        service={service}
        defaultInput={scoping.defaultQueryString?.(savedQueries)}
      />
      <IntegrationScopingFilterToggle
        scoping={scoping}
        meetingId={meetingId}
        teamId={teamId}
        state={state}
      />
    </ScopingSearchBar>
  )
}

export default IntegrationScopingSearchBar
