import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {SearchDialogResultsQuery} from '../../__generated__/SearchDialogResultsQuery.graphql'
import query from '../../__generated__/SearchDialogResultsQuery.graphql'
import {SearchDialogResult} from '../Dashboard/SearchDialogResult'
import {SearchDialogResultsRecent} from './SearchDialogResultsRecent'
import {SearchResultSectionHeader} from './SearchResultSectionHeader'

graphql`
  query SearchDialogResultsQuery($query: String!) {
    viewer {
      search(query: $query, first: 20 , type: page) {
        edges {
          ...SearchDialogResultsRecent_edges
          ...SearchDialogResult_edge
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
}

export const SearchDialogResults = (props: Props) => {
  const {queryRef, searchType} = props
  const data = usePreloadedQuery<SearchDialogResultsQuery>(query, queryRef)
  const {viewer} = data
  const {search} = viewer
  const {edges} = search

  if (searchType === 'recent') {
    return <SearchDialogResultsRecent edges={edges} />
  }
  const title = searchType === 'simple' ? 'Quick matches' : 'Best matches'
  return (
    <div>
      <SearchResultSectionHeader title={title} />
      {edges.map((edge) => {
        const {node} = edge
        const id = (node as any)?.id ?? 'new'
        return <SearchDialogResult edgeRef={edge} key={id} />
      })}
    </div>
  )
}
