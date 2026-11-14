import {getText, getTextSerializersFromSchema} from '@tiptap/core'
import {Fragment, type Node, type Schema} from '@tiptap/pm/model'
import {type EditorState, Selection, TextSelection, type Transaction} from '@tiptap/pm/state'
import {CALLOUT_CHILD_TYPES} from '../../../shared/tiptap/calloutTones'

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
    | 'callout'
  level?: number
}

const getCalloutChildren = (callout: Node) =>
  callout.children.filter((child) => child.type.name !== 'calloutTitle' || child.content.size > 0)

const isCalloutChild = (node: Node) =>
  CALLOUT_CHILD_TYPES.some((typeName) => typeName === node.type.name)

const toBold = (inline: Fragment, schema: Schema) => {
  const bold = schema.marks.bold
  if (!bold) return inline
  const content: Node[] = []
  inline.forEach((child) => {
    content.push(child.isText ? child.mark(bold.create().addToSet(child.marks)) : child)
  })
  return Fragment.from(content)
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
    case 'callout':
      return getCalloutChildren(node)[0]?.isTextblock ? {type: 'callout'} : null
    default:
      return null
  }
}

export const canTurnIntoPage = ({type}: TurnIntoTarget) =>
  type === 'paragraph' || type === 'heading'

export const isInsideCallout = (doc: Node, pos: number) => {
  if (pos < 0 || pos > doc.content.size) return false
  const $pos = doc.resolve(pos)
  for (let depth = $pos.depth; depth > 0; depth--) {
    if ($pos.node(depth).type.name === 'callout') return true
  }
  return false
}

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
  if (node.type.name === 'callout') return getFirstLine(getCalloutChildren(node)[0]!)
  if (node.type.name === 'calloutTitle') return toBold(node.content, node.type.schema)
  if (node.type.name === 'codeBlock') return codeToInline(node.textContent, node.type.schema)
  return node.isTextblock ? node.content : getFirstLine(node.child(0))
}

const getBody = (node: Node): readonly Node[] => {
  if (isListItem(node) || node.type.name === 'blockquote') return node.children.slice(1)
  if (node.type.name === 'callout') return getCalloutChildren(node).slice(1)
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
    case 'callout': {
      const spillIndex = body.findIndex((child) => !isCalloutChild(child))
      const inside = spillIndex === -1 ? body : body.slice(0, spillIndex)
      const spilled = spillIndex === -1 ? [] : body.slice(spillIndex)
      return [nodes.callout!.create({tone: 'plain'}, [paragraph, ...inside]), ...spilled]
    }
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
