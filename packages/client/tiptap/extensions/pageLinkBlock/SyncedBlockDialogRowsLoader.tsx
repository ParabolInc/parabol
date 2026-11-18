import {useEffect, useMemo} from 'react'
import type {PreloadedQuery} from 'react-relay'
import type {SyncedBlockDialogQuery} from '../../../__generated__/SyncedBlockDialogQuery.graphql'
import {getSyncedBlockDialogRows, type SyncedBlockDialogRows} from './getSyncedBlockDialogRows'
import {SyncedBlockDialogLoadFailed} from './SyncedBlockDialogLoadFailed'
import {useSyncedBlockDialogQuery} from './useSyncedBlockDialogQuery'

interface Props {
  queryRef: PreloadedQuery<SyncedBlockDialogQuery>
  currentPageId: string | undefined
  onRows: (rows: SyncedBlockDialogRows) => void
  onClose: () => void
}

export const SyncedBlockDialogRowsLoader = (props: Props) => {
  const {queryRef, currentPageId, onRows, onClose} = props
  const page = useSyncedBlockDialogQuery(queryRef)
  const rows = useMemo(
    () => (page ? getSyncedBlockDialogRows(page, currentPageId) : null),
    [page, currentPageId]
  )
  useEffect(() => {
    if (rows) onRows(rows)
  }, [rows, onRows])
  if (rows) return null
  return (
    <SyncedBlockDialogLoadFailed
      message="Couldn't load this synced block. Try again."
      onClose={onClose}
    />
  )
}
