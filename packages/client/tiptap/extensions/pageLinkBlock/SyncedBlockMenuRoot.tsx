import {Suspense} from 'react'
import ErrorBoundary from '../../../components/ErrorBoundary'
import {SyncedBlockOriginalProbe} from './SyncedBlockOriginalProbe'
import type {SyncedBlockOriginal} from './useSyncedBlockMenuActions'
import {useSyncedBlockPlacesQuery} from './useSyncedBlockPlacesQuery'

interface Props {
  pageCode: number
  currentPageId: string | undefined
  onOriginal: (original: SyncedBlockOriginal | null) => void
}

export const SyncedBlockMenuRoot = ({pageCode, currentPageId, onOriginal}: Props) => {
  const queryRef = useSyncedBlockPlacesQuery(pageCode)
  if (!queryRef) return null
  return (
    <ErrorBoundary fallback={() => null}>
      <Suspense fallback={null}>
        <SyncedBlockOriginalProbe
          queryRef={queryRef}
          currentPageId={currentPageId}
          onOriginal={onOriginal}
        />
      </Suspense>
    </ErrorBoundary>
  )
}
