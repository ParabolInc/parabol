import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import query, {type PageLinkAccessQuery} from '../../__generated__/PageLinkAccessQuery.graphql'

graphql`
  query PageLinkAccessQuery($pageIds: [ID!]!, $first: Int!) {
    viewer {
      pages(pageIds: $pageIds, first: $first) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`

interface Props {
  queryRef: PreloadedQuery<PageLinkAccessQuery>
  onAccess: (canOpenByPageCode: ReadonlyMap<number, boolean>) => void
}

export const PageLinkAccess = (props: Props) => {
  const {queryRef, onAccess} = props
  const {viewer} = usePreloadedQuery<PageLinkAccessQuery>(query, queryRef)
  const {edges} = viewer.pages
  useEffect(() => {
    const openablePageIds = new Set(edges.map(({node}) => node.id))
    const {pageIds} = queryRef.variables
    onAccess(
      new Map(pageIds.map((pageId) => [Number(pageId.split(':')[1]), openablePageIds.has(pageId)]))
    )
  }, [edges])
  return null
}
