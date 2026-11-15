import type {PreloadedQuery} from 'react-relay'
import {Lock} from '~/ui/icons'
import type {SyncedBlockPlacesQuery} from '../../../__generated__/SyncedBlockPlacesQuery.graphql'
import {MenuSeparator} from '../../../ui/Menu/MenuSeparator'
import {SyncedBlockPlaceRow} from './SyncedBlockPlaceRow'
import {syncedBlockPlaceRowClass} from './syncedBlockPlaceRowClass'
import {useSyncedBlockPlaces} from './useSyncedBlockPlaces'

interface Props {
  queryRef: PreloadedQuery<SyncedBlockPlacesQuery>
  currentPageId: string | undefined
}

export const SyncedBlockPlacesList = ({queryRef, currentPageId}: Props) => {
  const places = useSyncedBlockPlaces(queryRef, currentPageId)
  if (!places) return null
  const {rows, hiddenLabel, footer} = places
  return (
    <>
      {rows.map((row) => (
        <SyncedBlockPlaceRow key={row.pageId} row={row} />
      ))}
      {hiddenLabel && (
        <div className={syncedBlockPlaceRowClass}>
          <Lock className='shrink-0 text-[18px] text-fg-secondary' />
          <span className='min-w-0 flex-auto truncate text-fg-secondary'>{hiddenLabel}</span>
        </div>
      )}
      {footer && (
        <>
          <MenuSeparator className='my-1' />
          <div className='px-3 pt-2 pb-1.5 text-fg-muted text-xs'>{footer}</div>
        </>
      )}
    </>
  )
}
