import {useState} from 'react'
import syncedBlockPlacesQuery, {
  type SyncedBlockPlacesQuery
} from '../../../__generated__/SyncedBlockPlacesQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {getSyncedBlockPlacesFetchPolicy} from './getSyncedBlockPlacesFetchPolicy'

export const useSyncedBlockPlacesQuery = (pageCode: number) => {
  const [fetchPolicy] = useState(() => getSyncedBlockPlacesFetchPolicy(pageCode, Date.now()))
  return useQueryLoaderNow<SyncedBlockPlacesQuery>(
    syncedBlockPlacesQuery,
    {pageId: `page:${pageCode}`},
    fetchPolicy
  )
}
