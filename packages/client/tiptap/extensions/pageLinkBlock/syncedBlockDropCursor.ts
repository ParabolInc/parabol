import {Plugin} from '@tiptap/pm/state'
import type {EditorView} from '@tiptap/pm/view'
import {isInSyncedBlockContent} from './isInSyncedBlockContent'

export const disableDropCursorInSyncedBlock = (view: EditorView, _pos: unknown, event: DragEvent) =>
  isInSyncedBlockContent(event.target, view.dom)

// prosemirror-dropcursor only hides its line on a dragleave out of the editor, and a synced block
// swallows the drag events of drags it refuses, so the page's line would stay where it last was
export const clearDropCursorOverSyncedBlocks = () =>
  new Plugin({
    view(view) {
      const clear = (event: DragEvent) => {
        if (!isInSyncedBlockContent(event.target, view.dom)) return
        view.dom.dispatchEvent(new DragEvent('dragleave', {relatedTarget: null}))
      }
      view.dom.addEventListener('dragenter', clear, true)
      return {
        destroy() {
          view.dom.removeEventListener('dragenter', clear, true)
        }
      }
    }
  })
