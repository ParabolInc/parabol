import {Suspense} from 'react'
import type {PageRoleEnum} from '../../__generated__/NotificationSubscription.graphql'
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
  parentPageViewerAccess?: PageRoleEnum
}

export const SubPagesRoot = (props: Props) => {
  const {parentPageId, pageAncestors, teamId, parentPageViewerAccess} = props
  const queryRef = useQueryLoaderNow<SubPagesQuery>(query, {
    parentPageId,
    teamId
  })
  // If it's not a top-level page, fetch the yjs document in addition to the GQL metadata
  // Since the parentPageId will not change within the render tree, this hook is not called conditionally
  // biome-ignore lint/correctness/useHookAtTopLevel: legacy
  const pageLinks = parentPageId ? usePageChildren(parentPageId) : undefined
  return (
    <Suspense fallback={<Loader />}>
      {queryRef && (
        <SubPages
          queryRef={queryRef}
          pageAncestors={pageAncestors}
          pageLinks={pageLinks}
          parentPageViewerAccess={parentPageViewerAccess}
        />
      )}
    </Suspense>
  )
}
