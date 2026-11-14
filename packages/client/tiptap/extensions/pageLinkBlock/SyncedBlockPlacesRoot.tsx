import {Suspense} from 'react'
import ErrorBoundary from '../../../components/ErrorBoundary'
import MenuSkeletonRows from '../../../ui/Menu/MenuSkeletonRows'
import {SyncedBlockPlacesLabel} from './SyncedBlockPlacesLabel'
import {SyncedBlockPlacesList} from './SyncedBlockPlacesList'
import {SyncedBlockPlacesMenu} from './SyncedBlockPlacesMenu'
import {useSyncedBlockPlacesQuery} from './useSyncedBlockPlacesQuery'

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
  const queryRef = useSyncedBlockPlacesQuery(pageCode)
  const skeleton = <MenuSkeletonRows count={2} />
  const fallbackLabel = lastLabel ?? LOADING_LABEL
  return (
    <SyncedBlockPlacesMenu
      isViewOnly={isViewOnly}
      onOpenChange={onOpenChange}
      label={
        <ErrorBoundary fallback={() => fallbackLabel}>
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
        </ErrorBoundary>
      }
    >
      <ErrorBoundary fallback={() => null}>
        <Suspense fallback={skeleton}>
          {queryRef ? (
            <SyncedBlockPlacesList queryRef={queryRef} currentPageId={currentPageId} />
          ) : (
            skeleton
          )}
        </Suspense>
      </ErrorBoundary>
    </SyncedBlockPlacesMenu>
  )
}
