import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {SearchDialogResultsQuery} from '../../__generated__/SearchDialogResultsQuery.graphql'
import query from '../../__generated__/SearchDialogResultsQuery.graphql'
import {SearchDialogResult} from '../Dashboard/SearchDialogResult'

graphql`
  query SearchDialogResultsQuery($query: String!) {
    viewer {
      search(query: $query, first: 20 , type: page) {
        edges {
          ...SearchDialogResult_edge
          snippets
          node {
            __typename
            ... on Page {
              id
              title
            }
          }
        }
      }
    }
  }
`
interface Props {
  queryRef: PreloadedQuery<SearchDialogResultsQuery>
  searchType: 'recent' | 'simple' | 'semantic' | 'hybrid'
}

export const SearchDialogResults = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<SearchDialogResultsQuery>(query, queryRef)
  const {viewer} = data
  const {search} = viewer
  const {edges} = search

  return (
    <div>
      <h3 className='sticky top-0 z-10 flex flex-1 items-center text-nowrap bg-white p-1 font-medium text-xs'>
        Recent
      </h3>
      {edges.map((edge) => {
        const {node} = edge
        const id = (node as any)?.id ?? 'new'
        return <SearchDialogResult edgeRef={edge} key={id} />
      })}
    </div>
  )
}
