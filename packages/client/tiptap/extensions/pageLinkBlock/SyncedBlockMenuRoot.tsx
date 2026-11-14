import {Suspense} from 'react'
import syncedBlockPlacesQuery, {
  type SyncedBlockPlacesQuery
} from '../../../__generated__/SyncedBlockPlacesQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {SyncedBlockOriginalProbe} from './SyncedBlockOriginalProbe'
import type {SyncedBlockOriginal} from './useSyncedBlockMenuActions'

interface Props {
  pageCode: number
  currentPageId: string | undefined
  onOriginal: (original: SyncedBlockOriginal | null) => void
}

export const SyncedBlockMenuRoot = ({pageCode, currentPageId, onOriginal}: Props) => {
  const queryRef = useQueryLoaderNow<SyncedBlockPlacesQuery>(
    syncedBlockPlacesQuery,
    {pageId: `page:${pageCode}`},
    'store-and-network'
  )
  if (!queryRef) return null
  return (
    <Suspense fallback={null}>
      <SyncedBlockOriginalProbe
        queryRef={queryRef}
        currentPageId={currentPageId}
        onOriginal={onOriginal}
      />
    </Suspense>
  )
}
