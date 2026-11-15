import type {EditorView} from '@tiptap/pm/view'
import {getSyncedLinkAt} from './getSyncedLinkAt'

export type SyncedBlockDialogKind = 'unsyncCopy' | 'unsyncAll' | 'deleteAll' | 'whoHasAccess'

export const SYNCED_BLOCK_DIALOG_EVENT = 'synced-block-dialog'

export const openSyncedBlockDialog = (
  view: EditorView,
  pos: number,
  pageCode: number,
  kind: SyncedBlockDialogKind
) => {
  if (!getSyncedLinkAt(view.state.doc, pos, pageCode)) return
  view.nodeDOM(pos)?.dispatchEvent(new CustomEvent(SYNCED_BLOCK_DIALOG_EVENT, {detail: kind}))
}
