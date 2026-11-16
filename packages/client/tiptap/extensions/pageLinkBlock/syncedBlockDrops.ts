import {Extension} from '@tiptap/core'
import {Fragment, Slice} from '@tiptap/pm/model'
import {Plugin} from '@tiptap/pm/state'
import {
  type ActiveBlockDrag,
  getBlockDragState,
  peekBlockDrag,
  takeBlockDrag
} from '../../blockMove/blockDragSession'
import {getBlockDropRefusal} from '../../blockMove/getBlockDropRefusal'
import type {BlockDrop} from '../../blockMove/moveDroppedBlocks'
import {isDragFromOutside, isOverInnerSyncedEditor, trackDragOrigin} from './dragOrigin'
import {getBlockDropIndex} from './getBlockDropIndex'
import {readName} from './useSyncedBlockName'

type Options = {
  pageId: string
  isNested: boolean
  onBlockDrop: (drop: BlockDrop) => Promise<void>
}

type ForeignDrop =
  | {kind: 'ignore'}
  | {kind: 'refuse'}
  | {kind: 'move'; drag: ActiveBlockDrag; slice: Slice}

const IGNORE: ForeignDrop = {kind: 'ignore'}
const REFUSE: ForeignDrop = {kind: 'refuse'}

// A page and each synced block on it are separate editors. TipTap treats a native drop from another
// editor as a move and deletes what that editor has selected, so a block dragged in from another
// editor never reaches ProseMirror here: it is moved into this editor's page by hand
export const SyncedBlockDrops = Extension.create<Options>({
  name: 'syncedBlockDrops',

  addProseMirrorPlugins() {
    const {editor, options} = this
    const {pageId, isNested, onBlockDrop} = options
    return [
      new Plugin({
        view(view) {
          trackDragOrigin()
          let cached: {drag: ActiveBlockDrag; isViewOnly: boolean; drop: ForeignDrop} | null = null

          const decideBlockDrop = (drag: ActiveBlockDrag, isViewOnly: boolean): ForeignDrop => {
            const target = {
              pageId,
              viewerRole: isViewOnly ? ('viewer' as const) : undefined,
              isSyncedBlock: isNested
            }
            const dragState = getBlockDragState(drag.session, drag.refusal)
            if (getBlockDropRefusal(target, dragState)) return REFUSE
            const {blocks} = drag.session.movable
            return {
              kind: 'move',
              drag,
              slice: new Slice(Fragment.fromJSON(view.state.schema, blocks), 0, 0)
            }
          }

          const getForeignDrop = (event: DragEvent): ForeignDrop => {
            if (!isDragFromOutside(view) || isOverInnerSyncedEditor(event.target, view))
              return IGNORE
            const drag = peekBlockDrag()
            // a page's own editor sees a drag out of its synced blocks as internal, so TipTap deletes nothing
            if (!drag) return isNested ? REFUSE : IGNORE
            const isViewOnly = !editor.isEditable
            if (cached?.drag !== drag || cached.isViewOnly !== isViewOnly) {
              cached = {drag, isViewOnly, drop: decideBlockDrop(drag, isViewOnly)}
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
              drop.kind === 'move' ? getBlockDropIndex(view, event, drop.slice) : undefined
            leaveAfterDrop()
            if (drop.kind !== 'move') return
            takeBlockDrag()
            onBlockDrop({
              targetEditor: editor,
              session: drop.drag.session,
              targetPageId: pageId,
              targetTitle: readName(editor) || (isNested ? 'Synced block' : 'Untitled'),
              insertIndex
            }).catch((error) => {
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
    ]
  }
})
