import {getSchema} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import type {Node, Schema} from '@tiptap/pm/model'
import {EditorState, TextSelection} from '@tiptap/pm/state'
import {serverTipTapExtensions} from '../../../../shared/tiptap/serverTipTapExtensions'
import {getBlockUnitAt, normalizeBlockRange} from '../../../blockSelection/blockUnits'
import {turnRangeIntoSyncedBlock} from '../turnRangeIntoSyncedBlock'

const pagesExtensions = [
  Document.extend({content: 'heading block*'}),
  ...serverTipTapExtensions.map((extension) =>
    extension.name === 'starterKit'
      ? extension.configure({document: false, trailingNode: {node: 'paragraph'}})
      : extension
  )
]
const schema: Schema = getSchema(pagesExtensions)

type Json = Record<string, unknown>
const p = (value = ''): Json => ({
  type: 'paragraph',
  content: value ? [{type: 'text', text: value}] : []
})
const h = (level: number, value: string): Json => ({
  type: 'heading',
  attrs: {level},
  content: [{type: 'text', text: value}]
})
const ul = (...items: string[]): Json => ({
  type: 'bulletList',
  content: items.map((value) => ({type: 'listItem', content: [p(value)]}))
})
const details = (summary: string, ...content: Json[]): Json => ({
  type: 'details',
  attrs: {open: true},
  content: [
    {type: 'detailsSummary', content: [{type: 'text', text: summary}]},
    {type: 'detailsContent', content}
  ]
})
const pageLink = (pageCode: number, title: string): Json => ({
  type: 'pageLinkBlock',
  attrs: {pageCode, title, canonical: true}
})
const table = (...content: Json[]): Json => ({
  type: 'table',
  content: [{type: 'tableRow', content: [{type: 'tableCell', content}]}]
})
const callout = (...content: Json[]): Json => ({type: 'callout', attrs: {tone: 'info'}, content})

const TITLE = h(1, 'Title')
const makeState = (...blocks: Json[]) =>
  EditorState.create({doc: schema.nodeFromJSON({type: 'doc', content: [TITLE, ...blocks]})})
const toJSON = (block: Json) => schema.nodeFromJSON(block).toJSON()

const findPos = (doc: Node, label: string, type: string) => {
  let found = -1
  doc.descendants((node, pos) => {
    const isMatch = pos > 0 && node.type.name === type && node.textContent.startsWith(label)
    if (isMatch && found === -1) found = pos
  })
  if (found === -1) throw new Error(`No ${type} starting with ${label}`)
  return found
}
const unitAt = (state: EditorState, label: string, type: string) => {
  const range = getBlockUnitAt(state.doc, findPos(state.doc, label, type) + 1)
  if (!range) throw new Error(`No block unit at ${label}`)
  return range
}
const convert = (state: EditorState, range: Parameters<typeof turnRangeIntoSyncedBlock>[1]) => {
  const conversion = turnRangeIntoSyncedBlock(state, range)
  if (!conversion) throw new Error('Expected a transaction')
  conversion.tr.doc.check()
  return conversion.tr
}
const blocksOf = (doc: Node) => {
  const blocks: string[] = []
  doc.forEach((node, offset) => {
    if (offset > 0) blocks.push(`${node.type.name}:${node.textContent}`)
  })
  return blocks
}

test('a paragraph becomes the content of a synced block with a blank name', () => {
  const state = makeState(p('Escalation path'), p('after'))
  const tr = convert(state, unitAt(state, 'Escalation path', 'paragraph'))
  const link = tr.doc.child(1)
  expect(link.type.name).toBe('pageLinkBlock')
  expect(link.attrs).toMatchObject({
    pageCode: -1,
    canonical: true,
    synced: true,
    title: '',
    content: [toJSON(p('Escalation path'))]
  })
  expect(blocksOf(tr.doc)).toEqual(['pageLinkBlock:', 'paragraph:after'])
  expect(tr.selection).toBeInstanceOf(TextSelection)
  expect(tr.selection.$from.parent.textContent).toBe('after')
  expect(tr.selection.$from.parentOffset).toBe(0)
})

test('a list item keeps its list', () => {
  const state = makeState(ul('a', 'b', 'c'))
  const tr = convert(state, unitAt(state, 'b', 'listItem'))
  expect(blocksOf(tr.doc)).toEqual(['bulletList:a', 'pageLinkBlock:', 'bulletList:c'])
  expect(tr.doc.child(2).attrs).toMatchObject({title: '', content: [toJSON(ul('b'))]})
  expect(tr.selection.$from.parent.textContent).toBe('c')
})

test('the last items of a list that ends the page keep the rest of the list and a line after', () => {
  const state = makeState(p('before'), ul('a', 'b', 'c'))
  const {doc} = state
  const range = normalizeBlockRange(
    doc,
    findPos(doc, 'b', 'listItem') + 1,
    findPos(doc, 'c', 'listItem') + 1
  )
  const tr = convert(state, range!)
  expect(blocksOf(tr.doc)).toEqual([
    'paragraph:before',
    'bulletList:a',
    'pageLinkBlock:',
    'paragraph:'
  ])
  expect(tr.doc.child(3).attrs).toMatchObject({title: '', content: [toJSON(ul('b', 'c'))]})
  expect(tr.selection).toBeInstanceOf(TextSelection)
  expect(tr.selection.$from.parent).toBe(tr.doc.lastChild)
})

test('a leading heading names the selected blocks and travels in their content', () => {
  const state = makeState(h(2, 'Runbook'), p('Call the lead'), ul('Page', 'Wait'), p('after'))
  const {doc} = state
  const range = normalizeBlockRange(
    doc,
    findPos(doc, 'Runbook', 'heading') + 1,
    findPos(doc, 'Wait', 'listItem') + 1
  )
  const tr = convert(state, range!)
  expect(blocksOf(tr.doc)).toEqual(['pageLinkBlock:', 'paragraph:after'])
  expect(tr.doc.child(1).attrs).toMatchObject({
    title: 'Runbook',
    content: [h(2, 'Runbook'), p('Call the lead'), ul('Page', 'Wait')].map(toJSON)
  })
})

test('a heading anywhere but first does not name the block', () => {
  const state = makeState(p('Call the lead'), h(2, 'Runbook'), p('after'))
  const {doc} = state
  const range = normalizeBlockRange(
    doc,
    findPos(doc, 'Call the lead', 'paragraph') + 1,
    findPos(doc, 'Runbook', 'heading') + 1
  )
  const tr = convert(state, range!)
  expect(tr.doc.child(1).attrs).toMatchObject({
    title: '',
    content: [p('Call the lead'), h(2, 'Runbook')].map(toJSON)
  })
})

test('refuses blocks that hold a page link', () => {
  const state = makeState(details('Notes', p('see'), pageLink(5, 'Other')), p('after'))
  expect(turnRangeIntoSyncedBlock(state, unitAt(state, 'Notes', 'details'))).toBeNull()
})

test('refuses the page title', () => {
  const state = makeState(p('word'))
  const titleSize = state.doc.child(0).nodeSize
  expect(turnRangeIntoSyncedBlock(state, {from: 0, to: titleSize, depth: 0})).toBeNull()
  expect(
    turnRangeIntoSyncedBlock(state, {from: 0, to: state.doc.content.size, depth: 0})
  ).toBeNull()
})

test('refuses where a page link cannot stand', () => {
  const inTable = makeState(table(p('cell')), p('after'))
  const cellPos = findPos(inTable.doc, 'cell', 'paragraph')
  const cellRange = {
    from: cellPos,
    to: cellPos + inTable.doc.nodeAt(cellPos)!.nodeSize,
    depth: inTable.doc.resolve(cellPos).depth
  }
  expect(turnRangeIntoSyncedBlock(inTable, cellRange)).toBeNull()
  const inCallout = makeState(callout(p('inside')), p('after'))
  expect(turnRangeIntoSyncedBlock(inCallout, unitAt(inCallout, 'inside', 'paragraph'))).toBeNull()
})

test('leaves a line after a block that ends the page', () => {
  const state = makeState(p('one'), p('last'))
  const tr = convert(state, unitAt(state, 'last', 'paragraph'))
  expect(blocksOf(tr.doc)).toEqual(['paragraph:one', 'pageLinkBlock:', 'paragraph:'])
  expect(tr.selection).toBeInstanceOf(TextSelection)
  expect(tr.selection.$from.parent).toBe(tr.doc.lastChild)
})
