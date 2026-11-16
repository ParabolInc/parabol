import type {Editor} from '@tiptap/core'
import {Fragment, Slice} from '@tiptap/pm/model'
import {Plugin} from '@tiptap/pm/state'
import type {EditorView} from '@tiptap/pm/view'
import {GQLID} from '../../../utils/GQLID'
import {
  type ActiveBlockDrag,
  getBlockDragState,
  peekBlockDrag,
  takeBlockDrag
} from '../../blockMove/blockDragSession'
import {getSyncedBlockDropRefusal} from '../../blockMove/getBlockDropRefusal'
import type {SyncedBlockDrop} from '../../blockMove/moveBlocksIntoSyncedBlock'
import {isDragFromOutside, isOverInnerSyncedEditor, trackDragOrigin} from './dragOrigin'
import {getSyncedBlockDropIndex} from './getSyncedBlockDropIndex'

type Options = {
  editor: Editor
  hostView: EditorView
  getPos: () => number | undefined
  onBlockDrop: (drop: SyncedBlockDrop) => Promise<void>
}

type ForeignDrop =
  | {kind: 'ignore'}
  | {kind: 'refuse'}
  | {kind: 'move'; drag: ActiveBlockDrag; pageId: string; slice: Slice}

const IGNORE: ForeignDrop = {kind: 'ignore'}
const REFUSE: ForeignDrop = {kind: 'refuse'}

const decideBlockDrop = (
  view: EditorView,
  drag: ActiveBlockDrag,
  pageCode: number,
  isViewOnly: boolean
): ForeignDrop => {
  const pageId = GQLID.toKey(pageCode, 'page')
  const dragState = getBlockDragState(drag.session, drag.refusal)
  if (getSyncedBlockDropRefusal(pageId, isViewOnly, dragState)) return REFUSE
  const slice = new Slice(Fragment.fromJSON(view.state.schema, drag.session.movable.blocks), 0, 0)
  return {kind: 'move', drag, pageId, slice}
}

// TipTap treats a native drop from another editor as a move and deletes what that editor has
// selected, so a drag from outside never reaches ProseMirror here: block drags are moved in by hand
export const syncedBlockDrops = (options: Options) =>
  new Plugin({
    view(view) {
      trackDragOrigin()
      let cached: {drag: ActiveBlockDrag; key: string; drop: ForeignDrop} | null = null

      const getForeignDrop = (event: DragEvent): ForeignDrop => {
        if (!isDragFromOutside(view) || isOverInnerSyncedEditor(event.target, view)) return IGNORE
        const drag = peekBlockDrag()
        const pos = options.getPos()
        const pageCode: number | undefined =
          pos === undefined ? undefined : options.hostView.state.doc.nodeAt(pos)?.attrs.pageCode
        if (!drag || pageCode === undefined) return REFUSE
        const isViewOnly = !options.editor.isEditable
        const key = `${pageCode}:${isViewOnly}`
        if (cached?.drag !== drag || cached.key !== key) {
          cached = {drag, key, drop: decideBlockDrop(view, drag, pageCode, isViewOnly)}
        }
        return cached.drop
      }

      // ProseMirror draws its drop line, snapped to where the blocks fit, only while view.dragging holds them
      let isShowingDropLine = false
      const showDropLine = (slice: Slice) => {
        if (view.dragging) return
        view.dragging = {slice, move: false}
        isShowingDropLine = true
      }
      const hideDropLine = () => {
        cached = null
        if (!isShowingDropLine) return
        isShowingDropLine = false
        view.dragging = null
      }
      // the drop cursor clears on dragleave, which a swallowed drop never sends
      const leaveAfterDrop = () => view.dom.dispatchEvent(new DragEvent('dragleave'))

      const onDragOver = (event: DragEvent) => {
        const drop = getForeignDrop(event)
        if (drop.kind === 'refuse') event.stopPropagation()
        if (drop.kind === 'move') showDropLine(drop.slice)
      }
      const onDrop = (event: DragEvent) => {
        const drop = getForeignDrop(event)
        if (drop.kind === 'ignore') return
        event.stopPropagation()
        event.preventDefault()
        const insertIndex =
          drop.kind === 'move' ? getSyncedBlockDropIndex(view, event, drop.slice) : undefined
        leaveAfterDrop()
        if (drop.kind !== 'move') return
        takeBlockDrag()
        options
          .onBlockDrop({
            blockEditor: options.editor,
            session: drop.drag.session,
            targetPageId: drop.pageId,
            insertIndex
          })
          .catch((error) => {
            console.error(error)
          })
      }
      const onDragLeave = (event: DragEvent) => {
        const isStillInside =
          event.relatedTarget instanceof Node && view.dom.contains(event.relatedTarget)
        if (!isStillInside) hideDropLine()
      }

      view.dom.addEventListener('dragenter', onDragOver, true)
      view.dom.addEventListener('dragover', onDragOver, true)
      view.dom.addEventListener('drop', onDrop, true)
      view.dom.addEventListener('dragleave', onDragLeave)
      window.addEventListener('dragend', hideDropLine, true)
      return {
        destroy() {
          view.dom.removeEventListener('dragenter', onDragOver, true)
          view.dom.removeEventListener('dragover', onDragOver, true)
          view.dom.removeEventListener('drop', onDrop, true)
          view.dom.removeEventListener('dragleave', onDragLeave)
          window.removeEventListener('dragend', hideDropLine, true)
        }
      }
    }
  })
