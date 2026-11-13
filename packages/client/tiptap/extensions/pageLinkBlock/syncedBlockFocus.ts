import type {Editor} from '@tiptap/core'
import type {ResolvedPos} from '@tiptap/pm/model'
import {NodeSelection, Plugin, Selection, TextSelection} from '@tiptap/pm/state'
import type {EditorView} from '@tiptap/pm/view'

type Direction = 'up' | 'down' | 'left' | 'right'
type Edge = 'start' | 'end'

const ARROWS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right'
}

const isVertical = (direction: Direction) => direction === 'up' || direction === 'down'
const isForward = (direction: Direction) => direction === 'down' || direction === 'right'

const getNestedEditor = (view: EditorView, pos: number) => {
  const dom = view.nodeDOM(pos) as HTMLElement | null
  const nested = dom?.querySelector<HTMLElement & {editor?: Editor}>('.ProseMirror')
  return nested?.editor ?? null
}

const firstContentPos = (editor: Editor) => editor.state.doc.firstChild!.nodeSize

const placeInNested = (editor: Editor, edge: Edge, x: number | null) => {
  const {state, view} = editor
  const {doc} = state
  const min = firstContentPos(editor)
  let selection: Selection =
    edge === 'start' ? Selection.near(doc.resolve(min), 1) : Selection.atEnd(doc)
  if (x !== null) {
    const line = view.coordsAtPos(selection.from)
    const hit = view.posAtCoords({left: x, top: (line.top + line.bottom) / 2})
    if (hit && hit.pos >= min) selection = TextSelection.near(doc.resolve(hit.pos))
  }
  view.dispatch(state.tr.setSelection(selection).scrollIntoView())
  view.focus()
}

export const enterSyncedBlock = (
  view: EditorView,
  pos: number,
  edge: Edge,
  x: number | null = null
) => {
  const nested = getNestedEditor(view, pos)
  if (!nested) return false
  placeInNested(nested, edge, x)
  return true
}

const isSynced = (
  node: {type: {name: string}; attrs: Record<string, unknown>} | null | undefined
) => node?.type.name === 'pageLinkBlock' && !!node.attrs.synced

const isAtBlockEdge = ($head: ResolvedPos, forward: boolean) => {
  for (let depth = $head.depth - 1; depth >= 1; depth--) {
    const index = $head.index(depth)
    if (forward ? index !== $head.node(depth).childCount - 1 : index !== 0) return false
  }
  return true
}

export const syncedBlockEntryPlugin = () =>
  new Plugin({
    props: {
      handleKeyDown(view, event) {
        const direction = ARROWS[event.key]
        if (!direction || event.metaKey || event.ctrlKey || event.altKey) return false
        const {selection, doc} = view.state
        const forward = isForward(direction)
        if (event.shiftKey) {
          if (selection instanceof NodeSelection || !view.endOfTextblock(direction)) return false
          const {$head, anchor} = selection
          if ($head.depth < 1 || !isAtBlockEdge($head, forward)) return false
          let edge = forward ? $head.after(1) : $head.before(1)
          let crossed = false
          for (;;) {
            const $edge = doc.resolve(edge)
            const next = forward ? $edge.nodeAfter : $edge.nodeBefore
            if (!next || !isSynced(next)) break
            edge += forward ? next.nodeSize : -next.nodeSize
            crossed = true
          }
          if (!crossed) return false
          const target = Selection.findFrom(doc.resolve(edge), forward ? 1 : -1, true)
          if (!target) return false
          view.dispatch(view.state.tr.setSelection(TextSelection.create(doc, anchor, target.head)))
          return true
        }
        if (selection instanceof NodeSelection) {
          if (!isSynced(selection.node)) return false
          return enterSyncedBlock(view, selection.from, forward ? 'start' : 'end')
        }
        if (!selection.empty || !view.endOfTextblock(direction)) return false
        const {$head} = selection
        if ($head.depth < 1 || !isAtBlockEdge($head, forward)) return false
        const boundary = forward ? $head.after(1) : $head.before(1)
        const $boundary = doc.resolve(boundary)
        const sibling = forward ? $boundary.nodeAfter : $boundary.nodeBefore
        if (!sibling || !isSynced(sibling)) return false
        const pos = forward ? boundary : boundary - sibling.nodeSize
        const x = isVertical(direction) ? view.coordsAtPos($head.pos).left : null
        return enterSyncedBlock(view, pos, forward ? 'start' : 'end', x)
      }
    }
  })

export const exitSyncedBlock = (
  hostView: EditorView,
  blockPos: number,
  blockSize: number,
  direction: Direction,
  x: number | null
) => {
  const {state} = hostView
  const {doc} = state
  const forward = isForward(direction)
  const boundary = forward ? blockPos + blockSize : blockPos
  const $boundary = doc.resolve(boundary)
  const sibling = forward ? $boundary.nodeAfter : $boundary.nodeBefore
  if (sibling && isSynced(sibling)) {
    const siblingPos = forward ? boundary : boundary - sibling.nodeSize
    if (enterSyncedBlock(hostView, siblingPos, forward ? 'start' : 'end', x)) return true
  }
  let selection = Selection.findFrom($boundary, forward ? 1 : -1, true)
  if (!selection) return false
  if (x !== null && selection instanceof TextSelection) {
    const line = hostView.coordsAtPos(selection.from)
    const hit = hostView.posAtCoords({left: x, top: (line.top + line.bottom) / 2})
    if (hit) selection = TextSelection.near(doc.resolve(hit.pos))
  }
  hostView.dispatch(state.tr.setSelection(selection).scrollIntoView())
  hostView.focus()
  return true
}
