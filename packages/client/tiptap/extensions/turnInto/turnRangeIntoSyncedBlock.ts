import type {JSONContent} from '@tiptap/core'
import {Fragment} from '@tiptap/pm/model'
import {type EditorState, Selection} from '@tiptap/pm/state'
import {type BlockRange, isUnitParent} from '../../blockSelection/blockUnits'
import {toSingleLine} from './turnBlockInto'

const holdsPageLink = (units: Fragment) => {
  let found = false
  units.descendants((node) => {
    if (node.type.name === 'pageLinkBlock') found = true
    return !found
  })
  return found
}

export const turnRangeIntoSyncedBlock = (state: EditorState, range: BlockRange) => {
  const {doc, schema, tr} = state
  const titleSize = doc.firstChild?.nodeSize ?? 0
  if (range.from < titleSize || range.to <= range.from) return null
  const $from = doc.resolve(range.from)
  const parent = $from.parent
  if ($from.depth !== range.depth || !isUnitParent(parent)) return null
  const units = doc.slice(range.from, range.to).content
  const firstUnit = units.firstChild
  if (!firstUnit || holdsPageLink(units)) return null
  const isList = parent.type.isInGroup('list')
  const isNamed = firstUnit.type.name === 'heading'
  const seed: JSONContent[] = isList
    ? [parent.copy(units).toJSON()]
    : units.content.map((unit) => unit.toJSON())
  const link = schema.nodes.pageLinkBlock!.create({
    pageCode: -1,
    canonical: true,
    synced: true,
    title: isNamed ? toSingleLine(firstUnit.content, schema).trim() : '',
    content: seed
  })
  const startIndex = $from.index()
  const endIndex = doc.resolve(range.to).index()
  const itemsBefore = isList ? parent.content.cut(0, $from.parentOffset) : Fragment.empty
  const itemsAfter = isList ? parent.content.cut($from.parentOffset + units.size) : Fragment.empty
  const listBefore = itemsBefore.size ? [parent.copy(itemsBefore)] : []
  const listAfter = itemsAfter.size ? [parent.copy(itemsAfter)] : []
  const replacement = Fragment.from([...listBefore, link, ...listAfter])
  const from = isList ? $from.before() : range.from
  const to = isList ? $from.after() : range.to
  const $outer = doc.resolve(from)
  const canReplace = isList
    ? $outer.parent.canReplace($outer.index(), $outer.index() + 1, replacement)
    : parent.canReplace(startIndex, endIndex, replacement)
  if (!canReplace) return null
  tr.replaceWith(from, to, replacement)
  if (to === doc.content.size && !itemsAfter.size) {
    tr.insert(tr.doc.content.size, schema.nodes.paragraph!.create())
  }
  const $afterLink = tr.doc.resolve(from + (listBefore[0]?.nodeSize ?? 0) + link.nodeSize)
  const caret = Selection.findFrom($afterLink, 1, true) ?? Selection.findFrom($afterLink, -1, true)
  if (caret) tr.setSelection(caret)
  return {tr, link}
}
