import {Suspense} from 'react'
import syncedBlockPlacesQuery, {
  type SyncedBlockPlacesQuery
} from '../../../__generated__/SyncedBlockPlacesQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import MenuSkeletonRows from '../../../ui/Menu/MenuSkeletonRows'
import {SyncedBlockPlacesLabel} from './SyncedBlockPlacesLabel'
import {SyncedBlockPlacesList} from './SyncedBlockPlacesList'
import {SyncedBlockPlacesMenu} from './SyncedBlockPlacesMenu'

const LOADING_LABEL = 'Also on …'

interface Props {
  pageCode: number
  currentPageId: string | undefined
  isViewOnly: boolean
  lastLabel: string | null
  onLabel: (label: string) => void
  onOpenChange: (open: boolean) => void
}

export const SyncedBlockPlacesRoot = (props: Props) => {
  const {pageCode, currentPageId, isViewOnly, lastLabel, onLabel, onOpenChange} = props
  const queryRef = useQueryLoaderNow<SyncedBlockPlacesQuery>(
    syncedBlockPlacesQuery,
    {pageId: `page:${pageCode}`},
    'store-and-network'
  )
  const skeleton = <MenuSkeletonRows count={2} />
  const fallbackLabel = lastLabel ?? LOADING_LABEL
  return (
    <SyncedBlockPlacesMenu
      isViewOnly={isViewOnly}
      onOpenChange={onOpenChange}
      label={
        <Suspense fallback={fallbackLabel}>
          {queryRef ? (
            <SyncedBlockPlacesLabel
              queryRef={queryRef}
              currentPageId={currentPageId}
              fallback={fallbackLabel}
              onLabel={onLabel}
            />
          ) : (
            fallbackLabel
          )}
        </Suspense>
      }
    >
      <Suspense fallback={skeleton}>
        {queryRef ? (
          <SyncedBlockPlacesList queryRef={queryRef} currentPageId={currentPageId} />
        ) : (
          skeleton
        )}
      </Suspense>
    </SyncedBlockPlacesMenu>
  )
}
