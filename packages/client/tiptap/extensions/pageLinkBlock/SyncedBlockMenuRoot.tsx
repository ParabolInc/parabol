import {Suspense} from 'react'
import ErrorBoundary from '../../../components/ErrorBoundary'
import {type SyncedBlockMenuFacts, SyncedBlockMenuProbe} from './SyncedBlockMenuProbe'
import {useSyncedBlockPlacesQuery} from './useSyncedBlockPlacesQuery'

interface Props {
  pageCode: number
  currentPageId: string | undefined
  onProbe: (facts: SyncedBlockMenuFacts) => void
}

export const SyncedBlockMenuRoot = ({pageCode, currentPageId, onProbe}: Props) => {
  const queryRef = useSyncedBlockPlacesQuery(pageCode)
  if (!queryRef) return null
  return (
    <ErrorBoundary fallback={() => null}>
      <Suspense fallback={null}>
        <SyncedBlockMenuProbe queryRef={queryRef} currentPageId={currentPageId} onProbe={onProbe} />
      </Suspense>
    </ErrorBoundary>
  )
}
