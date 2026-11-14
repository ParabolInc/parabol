import {NodeSelection} from '@tiptap/pm/state'
import type {EditorView} from '@tiptap/pm/view'
import {getSyncedLinkAt} from './getSyncedLinkAt'

export const SYNCED_BLOCK_RENAME_EVENT = 'synced-block-rename'

export const startSyncedBlockRename = (view: EditorView, pos: number, pageCode: number) => {
  if (!getSyncedLinkAt(view.state.doc, pos, pageCode)) return
  view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)))
  view.nodeDOM(pos)?.dispatchEvent(new CustomEvent(SYNCED_BLOCK_RENAME_EVENT))
}
