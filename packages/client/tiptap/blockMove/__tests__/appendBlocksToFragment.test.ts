import type {JSONContent} from '@tiptap/core'
import * as Y from 'yjs'
import {appendBlocksToFragment} from '../appendBlocksToFragment'
import {removeMovedBlocks} from '../removeMovedBlocks'
import {destroyEditors, h, normalize, p, read, schema, seed, toggle} from './blockMoveTestHelpers'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))

afterEach(() => {
  destroyEditors()
})

test('appends after the last block', () => {
  const frag = seed(h(1, 'Q3'), p('ship search'))
  appendBlocksToFragment(frag, [p('moved')], schema)
  expect(read(frag)).toEqual(normalize([h(1, 'Q3'), p('ship search'), p('moved')]))
})

test('goes above a trailing empty paragraph, and right after a lone title', () => {
  const trailing = seed(h(1, 'Q3'), p('ship search'), {type: 'paragraph'})
  appendBlocksToFragment(trailing, [p('moved')], schema)
  expect(read(trailing)).toEqual(
    normalize([h(1, 'Q3'), p('ship search'), p('moved'), {type: 'paragraph'}])
  )
  const lone = seed(h(1, 'Q3'))
  appendBlocksToFragment(lone, [p('moved')], schema)
  expect(read(lone)).toEqual(normalize([h(1, 'Q3'), p('moved')]))
})

test('keeps marks and nested content', () => {
  const block = toggle('Notes', {
    type: 'paragraph',
    content: [{type: 'text', text: 'bold', marks: [{type: 'bold'}]}]
  })
  const frag = seed(h(1, 'Q3'))
  appendBlocksToFragment(frag, [block], schema)
  expect(read(frag)[1]).toEqual(normalize([block])[0])
})

test('removes only blocks nobody changed', () => {
  const frag = seed(h(1, 'Q3'))
  const moved = appendBlocksToFragment(frag, [p('a'), p('b')], schema)
  ;((frag.get(2) as Y.XmlElement).get(0) as Y.XmlText).insert(0, 'edited ')
  expect(removeMovedBlocks(frag, moved)).toEqual({removed: 1, kept: 1})
  expect(read(frag)).toEqual(normalize([h(1, 'Q3'), p('edited b')]))
})

test('finds blocks again in a freshly loaded copy of the doc', () => {
  const block = toggle('Notes', {
    type: 'paragraph',
    content: [{type: 'text', text: 'bold', marks: [{type: 'bold'}]}]
  })
  const frag = seed(h(1, 'Q3'))
  const moved = appendBlocksToFragment(frag, [block], schema)
  const copy = new Y.Doc()
  Y.applyUpdate(copy, Y.encodeStateAsUpdate(frag.doc!))
  const copyFrag = copy.getXmlFragment('default')
  expect(removeMovedBlocks(copyFrag, moved)).toEqual({removed: 1, kept: 0})
  expect(read(copyFrag)).toEqual(normalize([h(1, 'Q3')]))
})

test('counts an unknown client or a clock beyond local state as already gone', () => {
  const frag = seed(h(1, 'Q3'))
  const before = read(frag)
  const {client} = appendBlocksToFragment(frag, [p('a')], schema)[0]!
  const moved = [
    {client: 1, clock: 0, snapshot: '<paragraph></paragraph>'},
    {client, clock: 999999, snapshot: '<paragraph></paragraph>'}
  ]
  expect(removeMovedBlocks(frag, moved)).toEqual({removed: 2, kept: 0})
  expect(read(frag)).toEqual(normalize([...before, p('a')]))
})

test('counts a block someone else already deleted as removed', () => {
  const frag = seed(h(1, 'Q3'))
  const moved = appendBlocksToFragment(frag, [p('a'), p('b')], schema)
  frag.delete(1, 1)
  expect(removeMovedBlocks(frag, moved)).toEqual({removed: 2, kept: 0})
  expect(read(frag)).toEqual(normalize([h(1, 'Q3')]))
  expect(removeMovedBlocks(frag, moved)).toEqual({removed: 2, kept: 0})
})

test('keeps an item whose parent is not the fragment', () => {
  const frag = seed(h(1, 'Q3'), toggle('Notes', p('inner')))
  const details = frag.get(1) as Y.XmlElement
  const detailsContent = details.get(1) as Y.XmlElement
  const inner = detailsContent.get(0) as Y.XmlElement
  const id = inner._item!.id
  expect(
    removeMovedBlocks(frag, [{client: id.client, clock: id.clock, snapshot: inner.toString()}])
  ).toEqual({removed: 0, kept: 1})
  expect(detailsContent.length).toBe(1)
})

test('appends at the very end when the last paragraph has content', () => {
  const text = seed(h(1, 'Q3'), p('last'))
  appendBlocksToFragment(text, [p('moved')], schema)
  expect(read(text)).toEqual(normalize([h(1, 'Q3'), p('last'), p('moved')]))
  const hardBreak: JSONContent = {type: 'paragraph', content: [{type: 'hardBreak'}]}
  const withBreak = seed(h(1, 'Q3'), hardBreak)
  appendBlocksToFragment(withBreak, [p('moved')], schema)
  expect(read(withBreak)).toEqual(normalize([h(1, 'Q3'), hardBreak, p('moved')]))
})

test('inserts above an empty paragraph that directly follows the title', () => {
  const frag = seed(h(1, 'Q3'), {type: 'paragraph'})
  appendBlocksToFragment(frag, [p('moved')], schema)
  expect(read(frag)).toEqual(normalize([h(1, 'Q3'), p('moved'), {type: 'paragraph'}]))
})
