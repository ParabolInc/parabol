import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import query, {type SubPagesQuery} from '../../__generated__/SubPagesQuery.graphql'
import type {PageLinkBlockAttributes} from '../../shared/tiptap/extensions/PageLinkBlockBase'
import {LeftNavPageLink} from './LeftNavPageLink'

graphql`
  query SubPagesQuery($parentPageId: ID, $teamId: ID) {
    viewer {
      pages(first: 500, parentPageId: $parentPageId, teamId: $teamId)
        @connection(key: "User_pages") {
        edges {
          node {
            ...LeftNavPageLink_page
            id
          }
        }
      }
    }
  }
`
interface Props {
  queryRef: PreloadedQuery<SubPagesQuery>
  pageAncestors: string[]
  draggingPageId: string | null | undefined
  draggingPageIsPrivate: boolean | null
  pageLinks: PageLinkBlockAttributes[] | null | undefined
}

export const SubPages = (props: Props) => {
  const connectionKey = 'User_pages'
  const {pageAncestors, queryRef, draggingPageId, draggingPageIsPrivate, pageLinks} = props
  const data = usePreloadedQuery<SubPagesQuery>(query, queryRef)
  const {viewer} = data
  const {pages} = viewer
  const {edges} = pages
  const depth = pageAncestors.length
  const children = useMemo(() => {
    const nodes = edges.map((edge) => edge.node)
    // this is for top-level i.e. teamId
    if (pageLinks === undefined) return nodes
    // Prefer the title from GraphQL
    // yjs title changes propagate to GraphQL in usePageProvider
    if (pageLinks === null) return null
    return pageLinks
      .map(({pageCode}) => {
        const pageKey = `page:${pageCode}`
        const node = nodes.find((node) => node.id === pageKey)!
        return node
      })
      .filter(Boolean)!
  }, [pageLinks, edges])

  if (!children || children.length === 0) {
    const noLinksMessage = !children ? 'Loading' : 'No pages inside'
    return (
      <div style={{paddingLeft: depth * 8 + 8}} className='text-sm font-medium text-slate-500'>
        {noLinksMessage}
      </div>
    )
  }

  return (
    <>
      {children.map((node, idx) => {
        const nextPeer = children[idx + 1]
        const nextPeerId = nextPeer?.id ?? null
        return (
          <LeftNavPageLink
            key={node.id}
            pageRef={node}
            pageAncestors={pageAncestors}
            draggingPageId={draggingPageId}
            dropIdx={idx}
            isLastChild={idx === children.length - 1}
            nextPeerId={nextPeerId}
            connectionKey={connectionKey}
            draggingPageIsPrivate={draggingPageIsPrivate}
          />
        )
      })}
    </>
  )
}
