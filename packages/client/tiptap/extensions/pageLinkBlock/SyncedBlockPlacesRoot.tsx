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
  onOpenChange: (open: boolean) => void
}

export const SyncedBlockPlacesRoot = (props: Props) => {
  const {pageCode, currentPageId, isViewOnly, onOpenChange} = props
  const queryRef = useQueryLoaderNow<SyncedBlockPlacesQuery>(
    syncedBlockPlacesQuery,
    {pageId: `page:${pageCode}`},
    'store-and-network'
  )
  const skeleton = <MenuSkeletonRows count={2} />
  return (
    <SyncedBlockPlacesMenu
      isViewOnly={isViewOnly}
      onOpenChange={onOpenChange}
      label={
        <Suspense fallback={LOADING_LABEL}>
          {queryRef ? (
            <SyncedBlockPlacesLabel
              queryRef={queryRef}
              currentPageId={currentPageId}
              fallback={LOADING_LABEL}
            />
          ) : (
            LOADING_LABEL
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
