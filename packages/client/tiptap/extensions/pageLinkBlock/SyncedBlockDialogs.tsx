import type {Editor} from '@tiptap/core'
import useAtmosphere from '../../../hooks/useAtmosphere'
import type {UnsyncCopyConfirm} from './getUnsyncCopyConfirm'
import {unsyncCopyAt} from './requestSyncedBlockUnsyncCopy'
import {SyncedBlockDeleteAllDialogRoot} from './SyncedBlockDeleteAllDialogRoot'
import {SyncedBlockUnsyncAllDialogRoot} from './SyncedBlockUnsyncAllDialogRoot'
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
  const currentPageId = hostEditor.storage.pageLinkBlock.pageId
  const returnFocusToPage = (event: Event) => {
    event.preventDefault()
    if (!hostEditor.isDestroyed) hostEditor.commands.focus()
  }
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
          onCloseAutoFocus={returnFocusToPage}
        />
      )
    case 'unsyncAll':
      return (
        <SyncedBlockUnsyncAllDialogRoot
          pageCode={pageCode}
          currentPageId={currentPageId}
          onClose={onClose}
          onCloseAutoFocus={returnFocusToPage}
        />
      )
    case 'deleteAll':
      return (
        <SyncedBlockDeleteAllDialogRoot
          pageCode={pageCode}
          currentPageId={currentPageId}
          hostTitle={hostEditor.state.doc.firstChild?.textContent || '<Untitled>'}
          onClose={onClose}
          onCloseAutoFocus={returnFocusToPage}
        />
      )
    default:
      return null
  }
}
