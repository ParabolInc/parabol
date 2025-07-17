import {Suspense} from 'react'
import type {PageQuery} from '../../__generated__/PageQuery.graphql'
import pageQuery from '../../__generated__/PageQuery.graphql'
import type {useTipTapPageEditor_viewer$key} from '../../__generated__/useTipTapPageEditor_viewer.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import useRouter from '../../hooks/useRouter'
import {Page} from './Page'

interface Props {
  viewerRef: useTipTapPageEditor_viewer$key | null
}

export const PageRoot = (props: Props) => {
  const {viewerRef} = props
  const {match} = useRouter<{pageSlug: string}>()
  const {params} = match
  const {pageSlug} = params
  const pageCodeIdx = pageSlug.lastIndexOf('-')
  const pageId = `page:${Number(pageCodeIdx === -1 ? pageSlug : pageSlug.slice(pageCodeIdx + 1))}`

  const queryRef = useQueryLoaderNow<PageQuery>(
    pageQuery,
    {
      pageId
    },
    undefined,
    true
  )

  return (
    <Suspense fallback={''}>
      {queryRef && <Page queryRef={queryRef} viewerRef={viewerRef} pageId={pageId} />}
    </Suspense>
  )
}

export default PageRoot
