import {Suspense} from 'react'
import {useParams} from 'react-router-dom'
import type {Page_viewer$key} from '../../__generated__/Page_viewer.graphql'
import type {PageEntryQuery} from '../../__generated__/PageEntryQuery.graphql'
import pageQuery from '../../__generated__/PageEntryQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {GQLID} from '../../utils/GQLID'
import {PageEntry} from './PageEntry'

interface Props {
  viewerRef: Page_viewer$key | null
  isPublic?: boolean
}

export const PageRoot = (props: Props) => {
  const {viewerRef, isPublic} = props
  const {pageSlug} = useParams()
  const pageCodeIdx = pageSlug ? pageSlug.lastIndexOf('-') : -1
  const pageCode = !pageSlug ? '' : pageCodeIdx === -1 ? pageSlug : pageSlug.slice(pageCodeIdx + 1)
  const pageId = GQLID.toKey(pageCode, 'page')

  const queryRef = useQueryLoaderNow<PageEntryQuery>(pageQuery, {pageId})
  if (!pageSlug) return null
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <PageEntry queryRef={queryRef} viewerRef={viewerRef} isPublic={isPublic} pageId={pageId} />
      )}
    </Suspense>
  )
}

export default PageRoot
