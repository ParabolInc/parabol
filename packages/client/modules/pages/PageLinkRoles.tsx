import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import query, {
  type PageLinkRolesQuery,
  type PageRoleEnum
} from '../../__generated__/PageLinkRolesQuery.graphql'

graphql`
  query PageLinkRolesQuery($pageIds: [ID!]!) {
    viewer {
      pageRoles(pageIds: $pageIds)
    }
  }
`

interface Props {
  queryRef: PreloadedQuery<PageLinkRolesQuery>
  onRoles: (roles: ReadonlyMap<number, PageRoleEnum | null>) => void
}

export const PageLinkRoles = (props: Props) => {
  const {queryRef, onRoles} = props
  const {viewer} = usePreloadedQuery<PageLinkRolesQuery>(query, queryRef)
  const {pageRoles} = viewer
  useEffect(() => {
    const {pageIds} = queryRef.variables
    onRoles(
      new Map(pageIds.map((pageId, idx) => [Number(pageId.split(':')[1]), pageRoles[idx] ?? null]))
    )
  }, [pageRoles])
  return null
}
