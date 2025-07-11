import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {
  commitLocalUpdate,
  ConnectionHandler,
  usePreloadedQuery,
  type PreloadedQuery
} from 'react-relay'
import query, {type SubPagesQuery} from '../../__generated__/SubPagesQuery.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
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
  const atmosphere = useAtmosphere()
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
    return pageLinks.map(({pageCode, title}) => {
      const pageKey = `page:${pageCode}`
      const node = nodes.find((node) => node.id === pageKey)
      if (!node) {
        setTimeout(() => {
          commitLocalUpdate(atmosphere, (store) => {
            let existingPage = store.get(pageKey)
            if (!existingPage) {
              const parentPageId = pageAncestors.at(-1)
              existingPage = store.create(pageKey, 'Page')
              existingPage.setValue(pageKey, 'id')
              existingPage.setValue(parentPageId, 'parentPageId')
              existingPage.setValue(title, 'title')
              const viewer = store.getRoot().getLinkedRecord('viewer')!
              const conn = ConnectionHandler.getConnection(viewer, connectionKey, {
                parentPageId,
                teamId: undefined,
                isPrivate: undefined
              })!
              const edge = ConnectionHandler.createEdge(store, conn, existingPage, 'PageEdge')
              const edges = conn.getLinkedRecords('edges')!
              conn.setLinkedRecords([...edges, edge], 'edges')
            }
            return existingPage
          })
        })
      }
      return node
    })
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
        // TODO: when adding things via yjs they don't get added in GraphQL land, so we should maybe create them?
        if (!node) {
          console.log('pageLink exists but no page was found under that parent')
          return null
        }
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
