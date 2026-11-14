import {useEffect} from 'react'
import type {PreloadedQuery} from 'react-relay'
import type {SyncedBlockPlacesQuery} from '../../../__generated__/SyncedBlockPlacesQuery.graphql'
import type {SyncedBlockOriginal} from './useSyncedBlockMenuActions'
import {useSyncedBlockPlaces} from './useSyncedBlockPlaces'

interface Props {
  queryRef: PreloadedQuery<SyncedBlockPlacesQuery>
  currentPageId: string | undefined
  onOriginal: (original: SyncedBlockOriginal | null) => void
}

export const SyncedBlockOriginalProbe = ({queryRef, currentPageId, onOriginal}: Props) => {
  const original = useSyncedBlockPlaces(queryRef, currentPageId)?.original ?? null
  const pageId = original?.pageId
  const title = original?.title
  useEffect(() => {
    onOriginal(pageId === undefined || title === undefined ? null : {pageId, title})
  }, [pageId, title, onOriginal])
  return null
}
