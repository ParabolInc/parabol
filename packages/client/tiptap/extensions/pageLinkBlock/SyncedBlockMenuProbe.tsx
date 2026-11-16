import {useEffect} from 'react'
import type {PreloadedQuery} from 'react-relay'
import type {SyncedBlockPlacesQuery} from '../../../__generated__/SyncedBlockPlacesQuery.graphql'
import type {SyncedBlockOriginal} from './useSyncedBlockMenuActions'
import {useSyncedBlockPlaces} from './useSyncedBlockPlaces'

export interface SyncedBlockMenuFacts {
  original: SyncedBlockOriginal | null
  otherCount: number | null
  isOwner: boolean
}

interface Props {
  queryRef: PreloadedQuery<SyncedBlockPlacesQuery>
  currentPageId: string | undefined
  onProbe: (facts: SyncedBlockMenuFacts) => void
}

export const SyncedBlockMenuProbe = ({queryRef, currentPageId, onProbe}: Props) => {
  const places = useSyncedBlockPlaces(queryRef, currentPageId)
  const pageId = places?.original?.pageId
  const title = places?.original?.title
  const otherCount = places?.otherCount ?? null
  const isOwner = places?.isOwner ?? false
  useEffect(() => {
    const original = pageId === undefined || title === undefined ? null : {pageId, title}
    onProbe({original, otherCount, isOwner})
  }, [pageId, title, otherCount, isOwner, onProbe])
  return null
}
