import graphql from 'babel-plugin-relay/macro'
import {usePreloadedQuery, type PreloadedQuery} from 'react-relay'
import query, {type SubPagesQuery} from '../../__generated__/SubPagesQuery.graphql'
import {LeftNavPageLink} from './LeftNavPageLink'

graphql`
  query SubPagesQuery($parentPageId: ID!) {
    viewer {
      pages(first: 100, parentPageId: $parentPageId) @connection(key: "SubPages_pages") {
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
}

export const SubPages = (props: Props) => {
  const {pageAncestors, queryRef, draggingPageId} = props
  const data = usePreloadedQuery<SubPagesQuery>(query, queryRef)
  const {viewer} = data
  const {pages} = viewer
  const {edges} = pages

  if (edges.length === 0) {
    return <div className='pl-8 text-sm font-medium text-slate-500'>{'No pages inside'}</div>
  }
  return (
    <>
      {edges.map((edge, idx) => {
        const {node} = edge
        const {id} = node
        return (
          <LeftNavPageLink
            key={id}
            pageRef={node}
            pageAncestors={pageAncestors}
            draggingPageId={draggingPageId}
            isFirstChild={idx === 0}
          />
        )
      })}
    </>
  )
}
