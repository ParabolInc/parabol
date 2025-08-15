import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {PageEntryQuery} from '../../__generated__/PageEntryQuery.graphql'
import type {useTipTapPageEditor_viewer$key} from '../../__generated__/useTipTapPageEditor_viewer.graphql'
import Page from './Page'
import {PageNoAccess} from './PageNoAccess'

interface Props {
  viewerRef: useTipTapPageEditor_viewer$key | null
  queryRef: PreloadedQuery<PageEntryQuery>
}

export const PageEntry = (props: Props) => {
  const {viewerRef, queryRef} = props
  const query = usePreloadedQuery<PageEntryQuery>(
    graphql`
      query PageEntryQuery($pageId: ID!) {
        viewer {
          page(pageId: $pageId) {
            ...Page_page
            id
          }
        }
      }
    `,
    queryRef
  )

  const {viewer} = query
  const {page} = viewer
  if (!page) return <PageNoAccess />
  return <Page pageRef={page} viewerRef={viewerRef} />
}
