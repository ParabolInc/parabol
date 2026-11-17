import graphql from 'babel-plugin-relay/macro'
import type {Ref} from 'react'
import {useFragment} from 'react-relay'
import type {SearchDialogBestResults_viewer$key} from '../../__generated__/SearchDialogBestResults_viewer.graphql'
import type {ResultsListRefHandler} from './SearchDialogContent'
import {SearchDialogResultsList} from './SearchDialogResultsList'

interface Props {
  viewerRef: SearchDialogBestResults_viewer$key
  closeSearch: () => void
  resultsListRef: Ref<ResultsListRefHandler>
  query: string
  selectedId: string | null
  setSelectedId: (id: string | null) => void
}

export const SearchDialogBestResults = (props: Props) => {
  const {viewerRef, closeSearch, resultsListRef, query, selectedId, setSelectedId} = props
  const viewer = useFragment(
    graphql`
      fragment SearchDialogBestResults_viewer on User {
        best: search(query: $query, first: 20, dateField: $dateField, startAt: $startAt, endAt: $endAt, teamIds: $teamIds, type: page) {
          edges {
            ...SearchDialogResultsList_edges
          }
        }
      }
    `,
    viewerRef
  )
  return (
    <SearchDialogResultsList
      resultsListRef={resultsListRef}
      edgesRef={viewer.best.edges}
      title='Best matches'
      closeSearch={closeSearch}
      query={query}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
    />
  )
}
