import {type Ref, Suspense} from 'react'
import type {
  SearchDateTypeEnum,
  SearchDialogResultsQuery
} from '../../__generated__/SearchDialogResultsQuery.graphql'
import query from '../../__generated__/SearchDialogResultsQuery.graphql'
import ErrorBoundary from '../../components/ErrorBoundary'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {Loader} from '../../utils/relay/renderLoader'
import type {DateRange} from './DateRangeFilter'
import type {ResultsListRefHandler} from './SearchDialogContent'
import {SearchDialogResults} from './SearchDialogResults'

interface Props {
  searchQuery: string
  closeSearch: () => void
  resultsListRef: Ref<ResultsListRefHandler>
  dateField: SearchDateTypeEnum
  dateRange: DateRange | undefined
  teamIds: string[]
}

export const SearchDialogResultsRoot = (props: Props) => {
  const {searchQuery, closeSearch, resultsListRef, dateField, dateRange, teamIds} = props
  const queryRef = useQueryLoaderNow<SearchDialogResultsQuery>(query, {
    query: searchQuery,
    dateField: dateRange ? dateField : undefined,
    startAt: dateRange?.startAt ? dateRange.startAt : undefined,
    endAt: dateRange?.endAt ? dateRange.endAt : undefined,
    teamIds
  })
  const searchType = searchQuery === '' ? 'recent' : 'hybrid'

  return (
    <ErrorBoundary fallback={() => <div>Error calling search</div>}>
      <Suspense fallback={<Loader />}>
        {queryRef && (
          <SearchDialogResults
            resultsListRef={resultsListRef}
            queryRef={queryRef}
            searchType={searchType}
            closeSearch={closeSearch}
          />
        )}
      </Suspense>
    </ErrorBoundary>
  )
}
