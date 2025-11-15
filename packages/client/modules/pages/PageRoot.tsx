import {Suspense} from 'react'
import type {PageEntryQuery} from '../../__generated__/PageEntryQuery.graphql'
import pageQuery from '../../__generated__/PageEntryQuery.graphql'
import type {useTipTapPageEditor_viewer$key} from '../../__generated__/useTipTapPageEditor_viewer.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import useRouter from '../../hooks/useRouter'
import {GQLID} from '../../utils/GQLID'
import {PageEntry} from './PageEntry'

interface Props {
  viewerRef: useTipTapPageEditor_viewer$key | null
  isPublic?: boolean
}

export const PageRoot = (props: Props) => {
  const {viewerRef, isPublic} = props
  const {match} = useRouter<{pageSlug: string}>()
  const {params} = match
  const {pageSlug} = params
  const pageCodeIdx = pageSlug.lastIndexOf('-')
  const pageCode = pageCodeIdx === -1 ? pageSlug : pageSlug.slice(pageCodeIdx + 1)
  const pageId = GQLID.toKey(pageCode, 'page')

  const queryRef = useQueryLoaderNow<PageEntryQuery>(pageQuery, {pageId})
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <PageEntry queryRef={queryRef} viewerRef={viewerRef} isPublic={isPublic} pageId={pageId} />
      )}
    </Suspense>
  )
}

export default PageRoot
