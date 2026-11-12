import {Fragment, type Node} from '@tiptap/pm/model'
import {type EditorState, TextSelection, type Transaction} from '@tiptap/pm/state'

const unwrappedBlocks = (state: EditorState, callout: Node) => {
  const {paragraph, calloutTitle} = state.schema.nodes
  const bold = state.schema.marks.bold
  const blocks: Node[] = []
  callout.forEach((child) => {
    if (child.type !== calloutTitle) {
      blocks.push(child)
      return
    }
    if (child.content.size === 0 || !paragraph) return
    const content: Node[] = []
    child.content.forEach((inline) => {
      content.push(
        bold && inline.isText ? inline.mark(bold.create().addToSet(inline.marks)) : inline
      )
    })
    blocks.push(paragraph.create(null, content))
  })
  return blocks
}

const mapIntoUnwrapped = (callout: Node, pos: number, target: number) => {
  const title = callout.firstChild
  const droppedTitleSize =
    title?.type.name === 'calloutTitle' && title.content.size === 0 ? title.nodeSize : 0
  if (target <= pos) return target
  if (target >= pos + callout.nodeSize) return target - 2 - droppedTitleSize
  const bodyStart = pos + 1 + droppedTitleSize
  return Math.max(target, bodyStart) - 1 - droppedTitleSize
}

export const unwrapCallout = (state: EditorState, pos: number): Transaction | null => {
  const callout = state.doc.nodeAt(pos)
  if (callout?.type.name !== 'callout') return null
  const blocks = unwrappedBlocks(state, callout)
  if (blocks.length === 0) return null
  const $pos = state.doc.resolve(pos)
  const index = $pos.index()
  if (!$pos.parent.canReplace(index, index + 1, Fragment.from(blocks))) return null
  const {anchor, head} = state.selection
  const tr = state.tr.replaceWith(pos, pos + callout.nodeSize, blocks)
  const $anchor = tr.doc.resolve(mapIntoUnwrapped(callout, pos, anchor))
  const $head = tr.doc.resolve(mapIntoUnwrapped(callout, pos, head))
  return tr.setSelection(TextSelection.between($anchor, $head))
}
