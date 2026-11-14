import type {Editor} from '@tiptap/core'
import useAtmosphere from '../../../hooks/useAtmosphere'
import type {UnsyncCopyConfirm} from './getUnsyncCopyConfirm'
import {unsyncCopyAt} from './requestSyncedBlockUnsyncCopy'
import {SyncedBlockUnsyncCopyDialog} from './SyncedBlockUnsyncCopyDialog'

export type SyncedBlockDialog =
  | ({kind: 'unsyncCopy'} & UnsyncCopyConfirm)
  | {kind: 'unsyncAll' | 'deleteAll'}

interface Props {
  dialog: SyncedBlockDialog | null
  hostEditor: Editor
  getPos: () => number | undefined
  pageCode: number
  onClose: () => void
}

export const SyncedBlockDialogs = ({dialog, hostEditor, getPos, pageCode, onClose}: Props) => {
  const atmosphere = useAtmosphere()
  switch (dialog?.kind) {
    case 'unsyncCopy':
      return (
        <SyncedBlockUnsyncCopyDialog
          title={dialog.title}
          body={dialog.body}
          onConfirm={() => {
            onClose()
            unsyncCopyAt(atmosphere, hostEditor, getPos(), pageCode)
          }}
          onClose={onClose}
        />
      )
    default:
      return null
  }
}
