import {Suspense, useState} from 'react'
import syncedBlockDialogQuery, {
  type SyncedBlockDialogQuery
} from '../../../__generated__/SyncedBlockDialogQuery.graphql'
import ErrorBoundary from '../../../components/ErrorBoundary'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {snackOnError} from '../../../mutations/handlers/snackOnError'
import {useArchivePageMutation} from '../../../mutations/useArchivePageMutation'
import {GQLID} from '../../../utils/GQLID'
import type {SyncedBlockDialogRows} from './getSyncedBlockDialogRows'
import {SyncedBlockDeleteAllDialog} from './SyncedBlockDeleteAllDialog'
import {SyncedBlockDialogLoadFailed} from './SyncedBlockDialogLoadFailed'
import {SyncedBlockDialogRowsLoader} from './SyncedBlockDialogRowsLoader'

interface Props {
  pageCode: number
  currentPageId: string | undefined
  hostTitle: string
  onClose: () => void
  onCloseAutoFocus: (event: Event) => void
}

export const SyncedBlockDeleteAllDialogRoot = (props: Props) => {
  const {pageCode, currentPageId, hostTitle, onClose, onCloseAutoFocus} = props
  const pageId = GQLID.toKey(pageCode, 'page')
  const atmosphere = useAtmosphere()
  const [rows, setRows] = useState<SyncedBlockDialogRows | null>(null)
  const queryRef = useQueryLoaderNow<SyncedBlockDialogQuery>(
    syncedBlockDialogQuery,
    {pageId},
    'network-only'
  )
  const [executeArchive, submitting] = useArchivePageMutation()
  const fail = (error: {message: string}) => {
    onClose()
    snackOnError(atmosphere)(error)
  }
  const onConfirm = () => {
    if (!rows) return
    const {pageCount} = rows
    executeArchive({
      variables: {pageId, action: 'archive'},
      onCompleted: (_res, errors) => {
        const [error] = errors ?? []
        if (error) {
          fail(error)
          return
        }
        onClose()
        atmosphere.eventEmitter.emit('addSnackbar', {
          key: 'SyncedBlockDeletedAll',
          autoDismiss: 10,
          message: `Deleted from ${pageCount} pages and moved to Trash.`,
          action: {
            label: 'View Trash',
            callback: () => atmosphere.eventEmitter.emit('openPagesTrash')
          }
        })
      },
      onError: fail
    })
  }
  return (
    <>
      <SyncedBlockDeleteAllDialog
        rows={rows}
        hostTitle={hostTitle}
        isSubmitting={submitting}
        onConfirm={onConfirm}
        onClose={onClose}
        onCloseAutoFocus={onCloseAutoFocus}
      />
      <ErrorBoundary
        fallback={(error) => (
          <SyncedBlockDialogLoadFailed message={error.message} onClose={onClose} />
        )}
      >
        <Suspense fallback={null}>
          {queryRef && (
            <SyncedBlockDialogRowsLoader
              queryRef={queryRef}
              currentPageId={currentPageId}
              onRows={setRows}
              onClose={onClose}
            />
          )}
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
