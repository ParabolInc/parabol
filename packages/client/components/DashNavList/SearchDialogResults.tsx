import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {SearchDialogResultsQuery} from '../../__generated__/SearchDialogResultsQuery.graphql'
import query from '../../__generated__/SearchDialogResultsQuery.graphql'
import type {ResultsListRefHandler} from '../Dashboard/SearchDialog'
import {SearchDialogResultsList} from './SearchDialogResultsList'
import {SearchDialogResultsRecent} from './SearchDialogResultsRecent'

graphql`
  query SearchDialogResultsQuery($query: String!, $dateField: SearchDateTypeEnum, $startAt: DateTime, $endAt: DateTime, $teamIds: [ID!]) {
    viewer {
      search(query: $query, first: 20, dateField: $dateField, startAt: $startAt, endAt: $endAt, teamIds: $teamIds, type: page) {
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
    }
  }
`
interface Props {
  queryRef: PreloadedQuery<SearchDialogResultsQuery>
  searchType: 'recent' | 'simple' | 'hybrid'
  closeSearch: () => void
  resultsListRef: React.Ref<ResultsListRefHandler>
}

export const SearchDialogResults = (props: Props) => {
  const {queryRef, searchType, closeSearch, resultsListRef} = props
  const data = usePreloadedQuery<SearchDialogResultsQuery>(query, queryRef)
  const {viewer} = data
  const {search} = viewer
  const {edges} = search

  if (searchType === 'recent') {
    return (
      <SearchDialogResultsRecent
        resultsListRef={resultsListRef}
        edgesRef={edges}
        closeSearch={closeSearch}
      />
    )
  }
  const title = searchType === 'simple' ? 'Quick matches' : 'Best matches'
  return (
    <SearchDialogResultsList
      resultsListRef={resultsListRef}
      edgesRef={edges}
      title={title}
      closeSearch={closeSearch}
    />
  )
}
