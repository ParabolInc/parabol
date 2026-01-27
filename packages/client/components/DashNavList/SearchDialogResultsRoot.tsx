import {Suspense} from 'react'
import type {SearchDialogResultsQuery} from '../../__generated__/SearchDialogResultsQuery.graphql'
import query from '../../__generated__/SearchDialogResultsQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {Loader} from '../../utils/relay/renderLoader'
import ErrorBoundary from '../ErrorBoundary'
import {SearchDialogResults} from './SearchDialogResults'

interface Props {
  searchQuery: string
}

export const SearchDialogResultsRoot = (props: Props) => {
  const {searchQuery} = props
  const queryRef = useQueryLoaderNow<SearchDialogResultsQuery>(query, {
    query: searchQuery
  })
  const searchType = searchQuery === '' ? 'recent' : 'hybrid'

  return (
    <ErrorBoundary fallback={() => <div>Error calling search</div>}>
      <Suspense fallback={<Loader />}>
        {queryRef && <SearchDialogResults queryRef={queryRef} searchType={searchType} />}
      </Suspense>
    </ErrorBoundary>
  )
}
