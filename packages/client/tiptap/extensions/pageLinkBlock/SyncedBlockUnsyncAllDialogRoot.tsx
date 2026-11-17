import {Suspense, useState} from 'react'
import syncedBlockDialogQuery, {
  type SyncedBlockDialogQuery
} from '../../../__generated__/SyncedBlockDialogQuery.graphql'
import ErrorBoundary from '../../../components/ErrorBoundary'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {snackOnError} from '../../../mutations/handlers/snackOnError'
import {useUnsyncSyncedBlockMutation} from '../../../mutations/useUnsyncSyncedBlockMutation'
import {GQLID} from '../../../utils/GQLID'
import type {SyncedBlockDialogRows} from './getSyncedBlockDialogRows'
import {SyncedBlockDialogLoadFailed} from './SyncedBlockDialogLoadFailed'
import {SyncedBlockDialogRowsLoader} from './SyncedBlockDialogRowsLoader'
import {SyncedBlockUnsyncAllDialog} from './SyncedBlockUnsyncAllDialog'

interface Props {
  pageCode: number
  currentPageId: string | undefined
  onClose: () => void
  onCloseAutoFocus: (event: Event) => void
}

export const SyncedBlockUnsyncAllDialogRoot = (props: Props) => {
  const {pageCode, currentPageId, onClose, onCloseAutoFocus} = props
  const pageId = GQLID.toKey(pageCode, 'page')
  const atmosphere = useAtmosphere()
  const [rows, setRows] = useState<SyncedBlockDialogRows | null>(null)
  const queryRef = useQueryLoaderNow<SyncedBlockDialogQuery>(
    syncedBlockDialogQuery,
    {pageId},
    'network-only'
  )
  const [execute, submitting] = useUnsyncSyncedBlockMutation()
  const fail = (error: {message: string}) => {
    onClose()
    snackOnError(atmosphere)(error)
  }
  const onConfirm = () => {
    execute({
      variables: {pageId},
      onCompleted: (_res, errors) => {
        const [error] = errors ?? []
        if (error) fail(error)
        else onClose()
      },
      onError: fail
    })
  }
  return (
    <>
      <SyncedBlockUnsyncAllDialog
        rows={rows?.unsyncRows ?? null}
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
