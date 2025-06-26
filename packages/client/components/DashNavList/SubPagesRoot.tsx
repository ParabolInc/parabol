import {Suspense} from 'react'
import type {SubPagesQuery} from '../../__generated__/SubPagesQuery.graphql'
import query from '../../__generated__/SubPagesQuery.graphql'
import {usePageChildren} from '../../hooks/usePageChildren'
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
  // fetch the Yjs page contents and extract all the top-level blocks, which is the single source of truth for sortOrder
  // PLUS use GraphQL to fetch meta like if the viewer has ownership so they can delete
  // we can also locally write to the Relay store object. We do this in usePageProvider to update the title on keystroke
  // so local title changes update before Yjs changes propagate since those are debouced on the server

  // eslint-disable-next-line
  const pageLinks = parentPageId ? usePageChildren(parentPageId) : null
  return (
    <Suspense fallback={<Loader />}>
      {queryRef && (
        <SubPages
          queryRef={queryRef}
          pageAncestors={pageAncestors}
          draggingPageId={draggingPageId}
          draggingPageIsPrivate={draggingPageIsPrivate}
          pageLinks={pageLinks}
        />
      )}
    </Suspense>
  )
}
