import graphql from 'babel-plugin-relay/macro'
import {Suspense, useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {SearchDialogResultsQuery} from '../../__generated__/SearchDialogResultsQuery.graphql'
import gqlQuery from '../../__generated__/SearchDialogResultsQuery.graphql'
import {SearchDialogBestResults} from './SearchDialogBestResults'
import type {ResultsListRefHandler} from './SearchDialogContent'
import {SearchDialogResultsList} from './SearchDialogResultsList'
import {SearchDialogResultsRecent} from './SearchDialogResultsRecent'

graphql`
  query SearchDialogResultsQuery($query: String!, $hasQuery: Boolean!, $dateField: SearchDateTypeEnum, $startAt: DateTime, $endAt: DateTime, $teamIds: [ID!]) {
    viewer {
      quick: search(query: $query, first: 20, alpha: 0, dateField: $dateField, startAt: $startAt, endAt: $endAt, teamIds: $teamIds, type: page) {
        edges {
          ...SearchDialogResultsRecent_edges
          ...SearchDialogResultsList_edges
          node {
            ... on Page {
              id
            }
          }
        }
      }
      ...SearchDialogBestResults_viewer @include(if: $hasQuery) @defer
    }
  }
`
interface Props {
  queryRef: PreloadedQuery<SearchDialogResultsQuery>
  closeSearch: () => void
  resultsListRef: React.Ref<ResultsListRefHandler>
}

export const SearchDialogResults = (props: Props) => {
  const {queryRef, closeSearch, resultsListRef} = props
  const {query, hasQuery} = queryRef.variables
  const data = usePreloadedQuery<SearchDialogResultsQuery>(gqlQuery, queryRef)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const {viewer} = data
  const {quick} = viewer
  const {edges} = quick

  if (!hasQuery) {
    return (
      <SearchDialogResultsRecent
        resultsListRef={resultsListRef}
        edgesRef={edges}
        closeSearch={closeSearch}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
      />
    )
  }
  return (
    <Suspense
      key={queryRef.fetchKey}
      fallback={
        <SearchDialogResultsList
          resultsListRef={resultsListRef}
          edgesRef={edges}
          title='Quick matches'
          closeSearch={closeSearch}
          query={query}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />
      }
    >
      <SearchDialogBestResults
        viewerRef={viewer}
        closeSearch={closeSearch}
        resultsListRef={resultsListRef}
        query={query}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
      />
    </Suspense>
  )
}
