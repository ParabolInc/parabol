import {Suspense, useState} from 'react'
import syncedBlockPlacesQuery, {
  type SyncedBlockPlacesQuery
} from '../../../__generated__/SyncedBlockPlacesQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {SyncedBlockMenuItems, type SyncedBlockMenuItemsProps} from './SyncedBlockMenuItems'
import {SyncedBlockOriginalProbe} from './SyncedBlockOriginalProbe'

type Props = Omit<SyncedBlockMenuItemsProps, 'original'>

export const SyncedBlockMenuRoot = (props: Props) => {
  const {pageCode, currentPageId} = props
  const [original, setOriginal] = useState<SyncedBlockMenuItemsProps['original']>(null)
  const queryRef = useQueryLoaderNow<SyncedBlockPlacesQuery>(
    syncedBlockPlacesQuery,
    {pageId: `page:${pageCode}`},
    'store-and-network'
  )
  return (
    <>
      <SyncedBlockMenuItems {...props} original={original} />
      {queryRef && (
        <Suspense fallback={null}>
          <SyncedBlockOriginalProbe
            queryRef={queryRef}
            currentPageId={currentPageId}
            onOriginal={setOriginal}
          />
        </Suspense>
      )}
    </>
  )
}
