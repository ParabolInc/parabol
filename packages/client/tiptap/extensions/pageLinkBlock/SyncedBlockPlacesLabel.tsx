import type {PreloadedQuery} from 'react-relay'
import type {SyncedBlockPlacesQuery} from '../../../__generated__/SyncedBlockPlacesQuery.graphql'
import {useSyncedBlockPlaces} from './useSyncedBlockPlaces'

interface Props {
  queryRef: PreloadedQuery<SyncedBlockPlacesQuery>
  currentPageId: string | undefined
  fallback: string
}

export const SyncedBlockPlacesLabel = ({queryRef, currentPageId, fallback}: Props) => {
  const places = useSyncedBlockPlaces(queryRef, currentPageId)
  return <>{places?.label ?? fallback}</>
}
