import type {Editor} from '@tiptap/core'
import type Atmosphere from '../../../Atmosphere'
import {createBlockSelection} from '../../blockSelection/blockSelectionState'
import {prepareBlockDrag} from '../prepareBlockDrag'
import {destroyEditors, li, link, makeEditor, p, rangeOf, toggle} from './blockMoveTestHelpers'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../../hooks/usePageViewerAccess', () => ({
  lookupPageViewerAccess: (_env: unknown, pageCode: number) =>
    pageCode === 7 ? 'editor' : pageCode === 8 ? undefined : 'owner'
}))

afterEach(destroyEditors)

const plan = (editor: Editor, pos: number) =>
  prepareBlockDrag({
    editor,
    node: editor.state.doc.nodeAt(pos)!,
    pos,
    pageId: 'page:1',
    atmosphere: {} as unknown as Atmosphere
  })

const selectRun = (editor: Editor, from: number, to: number) => {
  const depth = editor.state.doc.resolve(from).depth
  const range = {from, to, depth}
  editor.view.dispatch(editor.state.tr.setSelection(createBlockSelection(editor.state.doc, range)))
  return range
}

test('the title never drags', () => {
  const editor = makeEditor(p('a'))
  expect(plan(editor, 0).kind).toBe('refuse')
})

test('a child page link uses the page drag', () => {
  const editor = makeEditor(link(5, 'Mine', true))
  expect(plan(editor, rangeOf(editor, 'pageLinkBlock', 0).from).kind).toBe('page')
})

test('a toggle holding a page I do not own is refused by name', () => {
  const editor = makeEditor(toggle('Notes', link(7, 'Hiring plan', true)))
  const result = plan(editor, rangeOf(editor, 'details', 0).from)
  expect(result).toMatchObject({kind: 'blocks', refusal: 'Only its owner can move Hiring plan'})
})

test('a child page whose access has not loaded yet is not refused at dragstart', () => {
  const editor = makeEditor(toggle('Notes', link(8, 'Unloaded', true)))
  const result = plan(editor, rangeOf(editor, 'details', 0).from)
  expect(result).toMatchObject({kind: 'blocks', refusal: null})
})

test('an upload in flight is refused', () => {
  const editor = makeEditor({type: 'fileUpload'})
  expect(plan(editor, rangeOf(editor, 'fileUpload', 0).from)).toMatchObject({
    kind: 'blocks',
    refusal: 'Wait for the upload to finish'
  })
})

test('one block on its own drags alone', () => {
  const editor = makeEditor(p('one'), p('two'))
  const {from, to} = rangeOf(editor, 'paragraph', 0)
  const result = plan(editor, from)
  if (result.kind !== 'blocks') throw new Error(result.kind)
  expect(result.selection).toBeNull()
  expect(result.session.count).toBe(1)
  expect(result.session.range.current()).toEqual({from, to})
})

describe('a block inside the block selection', () => {
  test('drags the whole selection and counts it', () => {
    const editor = makeEditor(p('one'), p('two'), p('three'), p('four'))
    const range = selectRun(
      editor,
      rangeOf(editor, 'paragraph', 0).from,
      rangeOf(editor, 'paragraph', 2).to
    )
    const result = plan(editor, rangeOf(editor, 'paragraph', 1).from)
    if (result.kind !== 'blocks') throw new Error(result.kind)
    expect(result.selection).toEqual(range)
    expect(result.session.count).toBe(3)
    expect(result.session.range.current()).toEqual({from: range.from, to: range.to})
    expect(result.session.movable.blocks.map((block) => block.content?.[0]?.text)).toEqual([
      'one',
      'two',
      'three'
    ])
  })

  test('counts list items, not the list around them', () => {
    const editor = makeEditor({type: 'bulletList', content: [li('a'), li('b'), li('c')]})
    const range = selectRun(
      editor,
      rangeOf(editor, 'listItem', 0).from,
      rangeOf(editor, 'listItem', 1).to
    )
    const result = plan(editor, rangeOf(editor, 'listItem', 0).from)
    if (result.kind !== 'blocks') throw new Error(result.kind)
    expect(result.selection).toEqual(range)
    expect(result.session.count).toBe(2)
    expect(result.session.movable.blocks).toMatchObject([
      {type: 'bulletList', content: [{type: 'listItem'}, {type: 'listItem'}]}
    ])
  })

  test('holding a child page still drags as blocks, not as a page', () => {
    const editor = makeEditor(p('one'), link(5, 'Mine', true), p('end'))
    selectRun(editor, rangeOf(editor, 'paragraph', 0).from, rangeOf(editor, 'pageLinkBlock', 0).to)
    const result = plan(editor, rangeOf(editor, 'pageLinkBlock', 0).from)
    expect(result).toMatchObject({kind: 'blocks', refusal: null, session: {count: 2}})
  })

  test('a lone selected child page keeps the page drag', () => {
    const editor = makeEditor(p('one'), link(5, 'Mine', true), p('end'))
    const {from, to} = rangeOf(editor, 'pageLinkBlock', 0)
    selectRun(editor, from, to)
    expect(plan(editor, from).kind).toBe('page')
  })

  test('is refused when it holds a page I do not own', () => {
    const editor = makeEditor(p('one'), link(7, 'Hiring plan', true), p('end'))
    selectRun(editor, rangeOf(editor, 'paragraph', 0).from, rangeOf(editor, 'pageLinkBlock', 0).to)
    const result = plan(editor, rangeOf(editor, 'paragraph', 0).from)
    expect(result).toMatchObject({kind: 'blocks', refusal: 'Only its owner can move Hiring plan'})
  })
})

test('a block outside the block selection drags alone', () => {
  const editor = makeEditor(p('one'), p('two'), p('three'))
  selectRun(editor, rangeOf(editor, 'paragraph', 0).from, rangeOf(editor, 'paragraph', 1).to)
  const {from, to} = rangeOf(editor, 'paragraph', 2)
  const result = plan(editor, from)
  if (result.kind !== 'blocks') throw new Error(result.kind)
  expect(result.selection).toBeNull()
  expect(result.session.count).toBe(1)
  expect(result.session.range.current()).toEqual({from, to})
})
