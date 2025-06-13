import {Suspense} from 'react'
import type {PageSharingQuery} from '../../__generated__/PageSharingQuery.graphql'
import pageSharingQuery from '../../__generated__/PageSharingQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {PageSharing} from './PageSharing'

interface Props {
  pageId: string
}

export const PageSharingRoot = (props: Props) => {
  const {pageId} = props
  const queryRef = useQueryLoaderNow<PageSharingQuery>(
    pageSharingQuery,
    {
      pageId
    },
    undefined,
    true
  )

  return (
    <Suspense fallback={''}>
      {queryRef && <PageSharing queryRef={queryRef} pageId={pageId} />}
    </Suspense>
  )
}
