import type {Editor, JSONContent} from '@tiptap/core'
import {Fragment, Slice} from '@tiptap/pm/model'
import {Plugin} from '@tiptap/pm/state'
import {dropPoint} from '@tiptap/pm/transform'
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

let dragOrigin: Element | null = null
let isTrackingDrags = false

const trackDragOrigin = () => {
  if (isTrackingDrags) return
  isTrackingDrags = true
  window.addEventListener(
    'dragstart',
    (event) => {
      const {target} = event
      dragOrigin =
        target instanceof Element ? target : target instanceof Node ? target.parentElement : null
    },
    true
  )
  window.addEventListener(
    'dragend',
    () => {
      dragOrigin = null
    },
    true
  )
  window.addEventListener(
    'drop',
    () => {
      setTimeout(() => {
        dragOrigin = null
      })
    },
    true
  )
}

const isForeignDrag = (view: EditorView) => {
  if (!dragOrigin) return false
  const container = view.dom.parentElement
  const isInsideThisEditor =
    !!container?.contains(dragOrigin) &&
    dragOrigin.closest('[data-synced-editor]') === view.dom.closest('[data-synced-editor]')
  return !isInsideThisEditor
}

const isInInnerSyncedEditor = (target: EventTarget | null, view: EditorView) => {
  const owner = target instanceof Element ? target.closest('[data-synced-editor]') : null
  return !!owner && owner !== view.dom.closest('[data-synced-editor]')
}

const carriesBlock = (blocks: JSONContent[], pageCode: number): boolean =>
  blocks.some(
    (block) =>
      (block.type === 'pageLinkBlock' && block.attrs?.pageCode === pageCode) ||
      carriesBlock(block.content ?? [], pageCode)
  )

const getDropIndex = (view: EditorView, event: DragEvent, slice: Slice) => {
  const coords = view.posAtCoords({left: event.clientX, top: event.clientY})
  if (!coords) return undefined
  const {doc} = view.state
  const $point = doc.resolve(dropPoint(doc, coords.pos, slice) ?? coords.pos)
  if ($point.depth === 0) return $point.index(0)
  const isLowerHalf = $point.pos > ($point.before(1) + $point.after(1)) / 2
  return $point.index(0) + (isLowerHalf ? 1 : 0)
}

type Options = {
  editor: Editor
  hostView: EditorView
  getPos: () => number | undefined
  onBlockDrop: (drop: SyncedBlockDrop) => Promise<void>
}

const getAcceptedDrop = ({editor, hostView, getPos}: Options) => {
  const drag = peekBlockDrag()
  const pos = getPos()
  const pageCode: number | undefined =
    pos === undefined ? undefined : hostView.state.doc.nodeAt(pos)?.attrs.pageCode
  if (!drag || pageCode === undefined) return null
  const pageId = GQLID.toKey(pageCode, 'page')
  const dragState = getBlockDragState(drag.session, drag.refusal)
  if (getSyncedBlockDropRefusal(pageId, !editor.isEditable, dragState)) return null
  if (carriesBlock(drag.session.movable.blocks, pageCode)) return null
  return {drag, pageId}
}

const toSlice = (view: EditorView, {session}: ActiveBlockDrag) =>
  new Slice(Fragment.fromJSON(view.state.schema, session.movable.blocks), 0, 0)

// A native drop from another editor runs TipTap's cross-editor move, which deletes whatever the
// source editor has selected, so every foreign drop stops here and only block drags become a move
export const routeForeignDrops = (options: Options) =>
  new Plugin({
    view(view) {
      trackDragOrigin()
      let isLending = false
      const returnSlice = () => {
        if (!isLending) return
        isLending = false
        view.dragging = null
      }
      const handle = (event: DragEvent) => {
        if (!isForeignDrag(view) || isInInnerSyncedEditor(event.target, view)) return
        const accepted = getAcceptedDrop(options)
        if (event.type !== 'drop') {
          if (!accepted) {
            event.stopPropagation()
          } else if (!view.dragging) {
            view.dragging = {slice: toSlice(view, accepted.drag), move: false}
            isLending = true
          }
          return
        }
        event.stopPropagation()
        event.preventDefault()
        const insertIndex = accepted
          ? getDropIndex(view, event, toSlice(view, accepted.drag))
          : undefined
        view.dom.dispatchEvent(new DragEvent('dragleave', {relatedTarget: null}))
        if (!accepted) return
        takeBlockDrag()
        options
          .onBlockDrop({
            blockEditor: options.editor,
            session: accepted.drag.session,
            targetPageId: accepted.pageId,
            insertIndex
          })
          .catch((error) => {
            console.error(error)
          })
      }
      const handleLeave = (event: DragEvent) => {
        if (!(event.relatedTarget instanceof Node && view.dom.contains(event.relatedTarget))) {
          returnSlice()
        }
      }
      const types = ['dragenter', 'dragover', 'drop'] as const
      types.forEach((type) => view.dom.addEventListener(type, handle, true))
      view.dom.addEventListener('dragleave', handleLeave)
      window.addEventListener('dragend', returnSlice, true)
      return {
        destroy() {
          types.forEach((type) => view.dom.removeEventListener(type, handle, true))
          view.dom.removeEventListener('dragleave', handleLeave)
          window.removeEventListener('dragend', returnSlice, true)
        }
      }
    }
  })
