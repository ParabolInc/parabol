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
}

export const SubPages = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<SubPagesQuery>(query, queryRef)
  const {viewer} = data
  const {pages} = viewer
  const {edges} = pages

  if (edges.length === 0) {
    return <div className='pl-8 text-sm font-medium text-slate-500'>{'No pages inside'}</div>
  }
  return (
    <div>
      {edges.map((edge) => {
        const {node} = edge
        const {id} = node
        return <LeftNavPageLink key={id} pageRef={node} />
      })}
    </div>
  )
}
