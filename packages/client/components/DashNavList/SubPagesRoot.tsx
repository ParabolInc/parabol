import {Suspense} from 'react'
import type {SubPagesQuery} from '../../__generated__/SubPagesQuery.graphql'
import query from '../../__generated__/SubPagesQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {Loader} from '../../utils/relay/renderLoader'
import {SubPages} from './SubPages'

interface Props {
  parentPageId?: string
  teamId?: string
  pageAncestors: string[]
  draggingPageId: string | null | undefined
  draggingPageIsPrivate: boolean | null
}

export const SubPagesRoot = (props: Props) => {
  const {parentPageId, pageAncestors, draggingPageId, draggingPageIsPrivate, teamId} = props
  const queryRef = useQueryLoaderNow<SubPagesQuery>(query, {
    parentPageId,
    teamId
  })

  return (
    <Suspense fallback={<Loader />}>
      {queryRef && (
        <SubPages
          queryRef={queryRef}
          pageAncestors={pageAncestors}
          draggingPageId={draggingPageId}
          draggingPageIsPrivate={draggingPageIsPrivate}
        />
      )}
    </Suspense>
  )
}
