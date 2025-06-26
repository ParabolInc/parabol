import graphql from 'babel-plugin-relay/macro'
import {usePreloadedQuery, type PreloadedQuery} from 'react-relay'
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
            title
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
  pageLinks: PageLinkBlockAttributes[] | null
}

export const SubPages = (props: Props) => {
  const connectionKey = 'User_pages'
  const {pageAncestors, queryRef, draggingPageId, draggingPageIsPrivate, pageLinks} = props
  const data = usePreloadedQuery<SubPagesQuery>(query, queryRef)
  const {viewer} = data
  const {pages} = viewer
  const {edges} = pages
  const depth = pageAncestors.length

  if (!pageLinks || pageLinks.length === 0) {
    const noLinksMessage = !pageLinks ? 'Loading' : 'No pages inside'
    return (
      <div style={{paddingLeft: depth * 8 + 8}} className='text-sm font-medium text-slate-500'>
        {noLinksMessage}
      </div>
    )
  }
  const nodes = edges.map((edge) => edge.node)
  return (
    <>
      {pageLinks.map((pageLink, idx) => {
        const {pageCode} = pageLink
        const pageKey = `page:${pageCode}`
        const nextPeer = pageLinks[idx + 1]
        const nextPeerId = nextPeer ? `page:${nextPeer.pageCode}` : null
        const node = nodes.find((node) => node.id === pageKey)
        if (!node) {
          console.log('pageLink exists but no page was found under that parent')
          return null
        }
        return (
          <LeftNavPageLink
            key={pageCode}
            pageRef={node}
            pageAncestors={pageAncestors}
            draggingPageId={draggingPageId}
            dropIdx={idx}
            isLastChild={idx === pageLinks.length - 1}
            nextPeerId={nextPeerId}
            connectionKey={connectionKey}
            draggingPageIsPrivate={draggingPageIsPrivate}
          />
        )
      })}
    </>
  )
}
