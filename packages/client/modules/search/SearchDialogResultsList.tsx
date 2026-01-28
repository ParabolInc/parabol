import graphql from 'babel-plugin-relay/macro'
import type {Ref} from 'react'
import {useFragment} from 'react-relay'
import type {SearchDialogResultsList_edges$key} from '../../__generated__/SearchDialogResultsList_edges.graphql'
import {SearchResultSectionHeader} from '../../components/DashNavList/SearchResultSectionHeader'
import type {ResultsListRefHandler} from './SearchDialogContent'
import {SearchDialogResult} from './SearchDialogResult'
import {useSearchListNavigation} from './useSearchListNavigation'

interface Props {
  edgesRef: SearchDialogResultsList_edges$key
  title: string
  closeSearch: () => void
  resultsListRef: Ref<ResultsListRefHandler>
}

export const SearchDialogResultsList = (props: Props) => {
  const {edgesRef, title, closeSearch, resultsListRef} = props
  const edges = useFragment(
    graphql`
        fragment SearchDialogResultsList_edges on SearchResultEdge @relay(plural: true) {
          ...SearchDialogResult_edge
          node {
            ... on Page {
              id
              title
            }
          }
        }
      `,
    edgesRef
  )
  const {selectedIndex, setSelectedIndex} = useSearchListNavigation(
    resultsListRef,
    edges,
    closeSearch
  )
  return (
    <>
      <SearchResultSectionHeader title={title} />
      {edges.map((edge, index) => {
        const {node} = edge
        const {id} = node
        return (
          <SearchDialogResult
            edgeRef={edge}
            key={id}
            closeSearch={closeSearch}
            isActive={index === selectedIndex}
            setSelectedIndex={() => {
              setSelectedIndex(index)
            }}
          />
        )
      })}
    </>
  )
}
