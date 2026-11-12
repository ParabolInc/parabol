import {getText, getTextSerializersFromSchema} from '@tiptap/core'
import {defaultRules, type RuleContext} from '@tiptap/extension-drag-handle'
import {Fragment, type Node, type Schema} from '@tiptap/pm/model'
import {type EditorState, Selection, TextSelection, type Transaction} from '@tiptap/pm/state'
import {pageDragHandleRules} from '../dragHandleRules'

export interface TurnIntoTarget {
  type:
    | 'paragraph'
    | 'heading'
    | 'pageLinkBlock'
    | 'bulletList'
    | 'orderedList'
    | 'taskList'
    | 'details'
    | 'codeBlock'
    | 'blockquote'
  level?: number
}

const isListItem = (node: Node) => node.type.name === 'listItem' || node.type.name === 'taskItem'

export const getTurnIntoTarget = (doc: Node, pos: number): TurnIntoTarget | null => {
  if (pos <= 0 || pos > doc.content.size) return null
  const node = doc.nodeAt(pos)
  if (!node) return null
  const $pos = doc.resolve(pos)
  for (let depth = $pos.depth; depth > 0; depth--) {
    const {name} = $pos.node(depth).type
    if (name === 'tableCell' || name === 'tableHeader') return null
  }
  if (isListItem(node)) return {type: $pos.parent.type.name as TurnIntoTarget['type']}
  switch (node.type.name) {
    case 'paragraph':
    case 'codeBlock':
    case 'details':
      return {type: node.type.name}
    case 'heading':
      return {type: 'heading', level: node.attrs.level}
    case 'blockquote':
      return node.firstChild?.isTextblock ? {type: 'blockquote'} : null
    default:
      return null
  }
}

// The score a drag handle candidate starts from, before the rules deduct from it
const DRAG_HANDLE_BASE_SCORE = 1000
const dragHandleRules = [...defaultRules, ...pageDragHandleRules]

// Picks the block the way the drag handle does: the innermost one that passes its rules
export const getSelectionTurnIntoPos = ({doc, selection}: EditorState): number | null => {
  const {$from, $to} = selection
  if (!$from.parent.isTextblock || !$from.sameParent($to)) return null
  for (let depth = $from.depth; depth > 0; depth--) {
    const parent = $from.node(depth - 1)
    const index = $from.index(depth - 1)
    const context = {
      node: $from.node(depth),
      pos: $from.before(depth),
      depth,
      parent,
      index,
      isFirst: index === 0,
      isLast: index === parent.childCount - 1,
      $pos: $from
    }
    // The rules only read the document, so there is no view to hand them
    const deduction = dragHandleRules.reduce(
      (sum, rule) => sum + rule.evaluate(context as RuleContext),
      0
    )
    if (deduction >= DRAG_HANDLE_BASE_SCORE) continue
    const pos = $from.before(depth)
    return getTurnIntoTarget(doc, pos) ? pos : null
  }
  return null
}

export const canTurnIntoPage = ({type}: TurnIntoTarget) =>
  type === 'paragraph' || type === 'heading'

const codeToInline = (code: string, schema: Schema) => {
  const inline: Node[] = []
  code
    .replace(/^\n+|\n+$/g, '')
    .split('\n')
    .forEach((line, index) => {
      if (index > 0) inline.push(schema.nodes.hardBreak!.create())
      if (line) inline.push(schema.text(line))
    })
  return Fragment.from(inline)
}

const getFirstLine = (node: Node): Fragment => {
  if (node.type.name === 'codeBlock') return codeToInline(node.textContent, node.type.schema)
  return node.isTextblock ? node.content : getFirstLine(node.child(0))
}

const getBody = (node: Node): readonly Node[] => {
  if (isListItem(node) || node.type.name === 'blockquote') return node.children.slice(1)
  if (node.type.name !== 'details') return []
  const content = node.child(1)
  const isDefaultContent =
    content.childCount === 1 &&
    content.child(0).type.name === 'paragraph' &&
    content.child(0).content.size === 0
  return isDefaultContent ? [] : content.children
}

const toPlainText = (inline: Fragment, schema: Schema) =>
  getText(schema.nodes.paragraph!.create(null, inline), {
    textSerializers: getTextSerializersFromSchema(schema)
  })

const toSingleLine = (inline: Fragment, schema: Schema) =>
  toPlainText(inline, schema).replace(/\n/g, ' ')

// a summary holds only text, so anything else in the line has to flatten into it
const toSummaryContent = (inline: Fragment, schema: Schema) => {
  const content: Node[] = []
  inline.forEach((child) => {
    const text = toSingleLine(Fragment.from(child), schema)
    if (text) content.push(schema.text(text, child.marks))
  })
  return Fragment.from(content)
}

const buildBlocks = (node: Node, target: TurnIntoTarget, schema: Schema): Node[] => {
  const {nodes} = schema
  const firstLine = getFirstLine(node)
  const body = getBody(node)
  const paragraph = nodes.paragraph!.create(null, firstLine)
  switch (target.type) {
    case 'paragraph':
      return [paragraph, ...body]
    case 'heading':
      return [nodes.heading!.create({level: target.level}, firstLine), ...body]
    case 'codeBlock': {
      const text = toPlainText(firstLine, schema)
      return [nodes.codeBlock!.create(null, text ? schema.text(text) : null), ...body]
    }
    case 'blockquote':
      return [nodes.blockquote!.create(null, [paragraph, ...body])]
    case 'details':
      return [
        nodes.details!.create({open: true}, [
          nodes.detailsSummary!.create(null, toSummaryContent(firstLine, schema)),
          nodes.detailsContent!.create(null, body.length ? body : nodes.paragraph!.create())
        ])
      ]
    case 'pageLinkBlock':
      return [
        nodes.pageLinkBlock!.create({
          pageCode: -1,
          title: toSingleLine(firstLine, schema).trim(),
          canonical: true
        })
      ]
    default: {
      const itemType = target.type === 'taskList' ? nodes.taskItem! : nodes.listItem!
      return [nodes[target.type]!.create(null, itemType.create(null, [paragraph, ...body]))]
    }
  }
}

const joinAdjacentLists = (tr: Transaction, from: number, to: number) => {
  const $from = tr.doc.resolve(from)
  const {parent} = $from
  // last to first, so a join doesn't move the boundaries still to come
  for (let index = tr.doc.resolve(to).index(); index >= $from.index(); index--) {
    const nodeBefore = parent.maybeChild(index - 1)
    const nodeAfter = parent.maybeChild(index)
    if (nodeBefore?.type === nodeAfter?.type && nodeBefore?.type.isInGroup('list')) {
      tr.join($from.posAtIndex(index))
    }
  }
}

export const turnBlockInto = (
  state: EditorState,
  pos: number,
  target: TurnIntoTarget
): Transaction | null => {
  const {doc, schema, tr} = state
  const current = getTurnIntoTarget(doc, pos)
  if (!current || (current.type === target.type && current.level === target.level)) return null
  if (target.type === 'pageLinkBlock' && !canTurnIntoPage(current)) return null
  const node = doc.nodeAt(pos)!
  const $pos = doc.resolve(pos)
  const blocks = buildBlocks(node, target, schema)
  const list = $pos.parent
  const itemsBefore = isListItem(node) ? list.content.cut(0, $pos.parentOffset) : Fragment.empty
  const itemsAfter = isListItem(node)
    ? list.content.cut($pos.parentOffset + node.nodeSize)
    : Fragment.empty
  const listBefore = itemsBefore.size ? [list.copy(itemsBefore)] : []
  const listAfter = itemsAfter.size ? [list.copy(itemsAfter)] : []
  const replacement = Fragment.from([...listBefore, ...blocks, ...listAfter])
  const from = isListItem(node) ? $pos.before() : pos
  const to = isListItem(node) ? $pos.after() : pos + node.nodeSize
  const $from = doc.resolve(from)
  if (!$from.parent.canReplace($from.index(), $from.index() + 1, replacement)) return null
  tr.replaceWith(from, to, replacement)
  // Until TrailingNode runs, a link ending the doc has no line after it and the caret would fall onto
  // the link, where the next key replaces it and trashes the new page
  if (target.type === 'pageLinkBlock' && to === doc.content.size) {
    tr.insert(tr.doc.content.size, schema.nodes.paragraph!.create())
  }
  const blockStart = from + (listBefore[0]?.nodeSize ?? 0)
  const firstLine = Selection.findFrom(tr.doc.resolve(blockStart), 1, true)
  if (firstLine) tr.setSelection(TextSelection.create(tr.doc, firstLine.$from.end()))
  joinAdjacentLists(tr, from, from + replacement.size)
  return tr
}
