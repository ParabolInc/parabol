import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {Page_viewer$key} from '../../__generated__/Page_viewer.graphql'
import type {PageEntryQuery} from '../../__generated__/PageEntryQuery.graphql'
import Page from './Page'
import {PageNoAccess} from './PageNoAccess'

graphql`
  fragment PageEntry_page on Page {
    id
    access {
      viewer
      public
    }
  }
`

interface Props {
  viewerRef: Page_viewer$key | null
  queryRef: PreloadedQuery<PageEntryQuery>
  isPublic?: boolean
  pageId: string
}

export const PageEntry = (props: Props) => {
  const {viewerRef, queryRef, isPublic, pageId} = props
  const query = usePreloadedQuery<PageEntryQuery>(
    graphql`
      query PageEntryQuery($pageId: ID!) {
        public {
          page(pageId: $pageId) {
            ...Page_page
            ...PageEntry_page @relay(mask: false)
          }
        }
      }
    `,
    queryRef
  )

  const {page} = query.public
  const canAccess = page?.access.viewer || page?.access.public
  if (!canAccess) return <PageNoAccess pageId={pageId} />
  return <Page pageRef={page} viewerRef={viewerRef} isPublic={isPublic} />
}
