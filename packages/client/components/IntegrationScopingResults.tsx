import {Suspense, useState} from 'react'
import MockScopingTask from '~/modules/meeting/components/MockScopingTask'
import type {useGetUsedServiceTaskIds_phase$key} from '../__generated__/useGetUsedServiceTaskIds_phase.graphql'
import useGetUsedServiceTaskIds from '../hooks/useGetUsedServiceTaskIds'
import useLoadNextOnScrollBottom from '../hooks/useLoadNextOnScrollBottom'
import type {
  ScopingCapability,
  ScopingSavedQuery
} from '../integrations/platform/ClientIntegrationDefinition'
import type {RegisteredClientIntegration} from '../integrations/platform/registry'
import type {
  ScopingResults,
  ScopingSearchContext,
  ScopingSearchState
} from '../integrations/platform/ScopingSearchState'
import usePersistIntegrationSearchQueryMutation from '../mutations/usePersistIntegrationSearchQueryMutation'
import {
  type IntegrationSearchFilter,
  sortSearchFilters
} from '../shared/integrations/IntegrationSearchFilter'
import Ellipsis from './Ellipsis/Ellipsis'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import IntegrationScopingSelectAll from './IntegrationScopingSelectAll'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'
import ScopingSearchResultItem from './ScopingSearchResultItem'

const canonicalize = (
  queryString: string,
  isAdvancedQuery: boolean,
  filters: readonly IntegrationSearchFilter[]
) => JSON.stringify({queryString, isAdvancedQuery, filters: sortSearchFilters(filters)})

interface Props {
  results: ScopingResults
  scoping: ScopingCapability
  service: RegisteredClientIntegration
  context: ScopingSearchContext
  state: ScopingSearchState
  savedQueries: readonly ScopingSavedQuery[]
  estimatePhaseRef: useGetUsedServiceTaskIds_phase$key | null
}

const IntegrationScopingResults = (props: Props) => {
  const {results, scoping, service, context, state, savedQueries, estimatePhaseRef} = props
  const {meetingId, teamId, providerId} = context
  const {NewRecordInput} = scoping
  const {items, hasNext, isLoadingNext = false, loadNext} = results
  const [isEditing, setIsEditing] = useState(false)
  const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhaseRef)
  const [persistIntegrationSearchQuery] = usePersistIntegrationSearchQueryMutation()
  const lastItem = useLoadNextOnScrollBottom({
    hasNext,
    isLoadingNext,
    loadNext: () => loadNext?.()
  })

  const persistQuery = () => {
    const queryString = state.queryString.trim()
    if (!queryString) return
    if (scoping.isDefaultQuery?.(state)) return
    const filters = sortSearchFilters(state.filters)
    const lookupKey = canonicalize(queryString, state.isAdvancedQuery, filters)
    const isQueryNew = !savedQueries.some(
      (saved) => canonicalize(saved.queryString, saved.isAdvancedQuery, saved.filters) === lookupKey
    )
    if (!isQueryNew) return
    persistIntegrationSearchQuery({
      variables: {
        teamId,
        providerId,
        queryString,
        meta: scoping.serializeMeta({...state, filters})
      }
    })
  }

  const newRecordButton = NewRecordInput ? (
    <NewIntegrationRecordButton
      onClick={() => setIsEditing(true)}
      labelText={scoping.newRecordLabel ?? 'New Issue'}
    />
  ) : null

  const errorMessage = scoping.validate?.(state) ?? results.error
  if (items.length === 0 && !isEditing) {
    return (
      <>
        <IntegrationScopingNoResults error={errorMessage} msg={'No issues match that query'} />
        {newRecordButton}
      </>
    )
  }
  return (
    <>
      {scoping.selectAllNoun && (
        <IntegrationScopingSelectAll
          items={items}
          usedServiceTaskIds={usedServiceTaskIds}
          meetingId={meetingId}
          service={service}
          noun={scoping.selectAllNoun}
          persistQuery={persistQuery}
        />
      )}
      <div className='overflow-auto'>
        {NewRecordInput && (
          <Suspense fallback={<MockScopingTask idx={0} />}>
            <NewRecordInput
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              meetingId={meetingId}
              teamId={teamId}
            />
          </Suspense>
        )}
        {items.map((item) => (
          <ScopingSearchResultItem
            key={item.serviceTaskId}
            service={service}
            usedServiceTaskIds={usedServiceTaskIds}
            meetingId={meetingId}
            persistQuery={persistQuery}
            {...item}
          />
        ))}
        {lastItem}
        {hasNext && (
          <div className='flex h-8 w-full justify-center text-2xl'>
            <Ellipsis />
          </div>
        )}
      </div>
      {!isEditing && newRecordButton}
    </>
  )
}

export default IntegrationScopingResults
