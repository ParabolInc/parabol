import type {Editor} from '@tiptap/core'
import {type RefObject, useCallback, useEffect, useState} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {getSyncedBlockEventTarget} from './getSyncedBlockEventTarget'
import {SYNCED_BLOCK_DIALOG_EVENT, type SyncedBlockDialogKind} from './openSyncedBlockDialog'
import {requestSyncedBlockUnsyncCopy} from './requestSyncedBlockUnsyncCopy'
import type {SyncedBlockDialog} from './SyncedBlockDialogs'

interface Params {
  wrapperRef: RefObject<HTMLElement | null>
  editor: Editor
  getPos: () => number | undefined
  pageCode: number
}

export const useSyncedBlockDialog = ({wrapperRef, editor, getPos, pageCode}: Params) => {
  const atmosphere = useAtmosphere()
  const [dialog, setDialog] = useState<SyncedBlockDialog | null>(null)
  const [isCheckingUnsync, setIsCheckingUnsync] = useState(false)
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const target = getSyncedBlockEventTarget(wrapper)
    const handleDialog = async (event: Event) => {
      const kind = (event as CustomEvent<SyncedBlockDialogKind>).detail
      if (kind !== 'unsyncCopy') {
        setDialog({kind})
        return
      }
      setIsCheckingUnsync(true)
      try {
        await requestSyncedBlockUnsyncCopy({
          atmosphere,
          hostEditor: editor,
          getPos,
          pageCode,
          onConfirmNeeded: (confirm) => setDialog({kind, ...confirm})
        })
      } finally {
        setIsCheckingUnsync(false)
      }
    }
    target.addEventListener(SYNCED_BLOCK_DIALOG_EVENT, handleDialog)
    return () => target.removeEventListener(SYNCED_BLOCK_DIALOG_EVENT, handleDialog)
  }, [wrapperRef, atmosphere, editor, getPos, pageCode])
  const closeDialog = useCallback(() => setDialog(null), [])
  return {dialog, isCheckingUnsync, closeDialog}
}
