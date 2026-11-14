import {useEffect} from 'react'
import type {PreloadedQuery} from 'react-relay'
import type {SyncedBlockPlacesQuery} from '../../../__generated__/SyncedBlockPlacesQuery.graphql'
import {useSyncedBlockPlaces} from './useSyncedBlockPlaces'

interface Props {
  queryRef: PreloadedQuery<SyncedBlockPlacesQuery>
  currentPageId: string | undefined
  fallback: string
  onLabel: (label: string) => void
}

export const SyncedBlockPlacesLabel = ({queryRef, currentPageId, fallback, onLabel}: Props) => {
  const label = useSyncedBlockPlaces(queryRef, currentPageId)?.label
  useEffect(() => {
    if (label) onLabel(label)
  }, [label, onLabel])
  return <>{label ?? fallback}</>
}
