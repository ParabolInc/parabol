import {
  destroyEditors,
  li,
  makeEditor,
  p,
  toggle
} from '../../blockMove/__tests__/blockMoveTestHelpers'
import {happyWindow} from '../../extensions/__tests__/installHappyDom'
import {isBlockRun} from '../blockSelectionState'
import {countBlocks, getBlockUnitAt, normalizeBlockRange} from '../blockUnits'
import {callout, nodeNamesIn, posInText, table2x2, textsIn} from './blockSelectionTestHelpers'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))

afterEach(() => {
  destroyEditors()
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

test('two items inside one list are just those items', () => {
  const editor = makeEditor(p('Owners'), {
    type: 'bulletList',
    content: [li('a'), li('b'), li('c'), li('d')]
  })
  const range = normalizeBlockRange(
    editor.state.doc,
    posInText(editor, 'b'),
    posInText(editor, 'c')
  )!
  expect(textsIn(editor, range)).toEqual(['b', 'c'])
  expect(countBlocks(editor.state.doc, range)).toBe(2)
})

test('a run that leaves a list takes the whole list', () => {
  const editor = makeEditor(
    p('Owners'),
    {type: 'bulletList', content: [li('a'), li('b')]},
    p('after')
  )
  const range = normalizeBlockRange(
    editor.state.doc,
    posInText(editor, 'b'),
    posInText(editor, 'after')
  )!
  expect(nodeNamesIn(editor, range)).toEqual(['bulletList', 'paragraph'])
})

test('children inside a toggle stay inside it; reaching past it takes the toggle', () => {
  const editor = makeEditor(toggle('Notes', p('one'), p('two'), p('three')), p('after'))
  expect(
    textsIn(
      editor,
      normalizeBlockRange(editor.state.doc, posInText(editor, 'one'), posInText(editor, 'two'))!
    )
  ).toEqual(['one', 'two'])
  expect(
    nodeNamesIn(
      editor,
      normalizeBlockRange(editor.state.doc, posInText(editor, 'two'), posInText(editor, 'after'))!
    )
  ).toEqual(['details', 'paragraph'])
})

test('the title is never in a run', () => {
  const editor = makeEditor(p('first'), p('second'))
  const range = normalizeBlockRange(editor.state.doc, 2, posInText(editor, 'second'))!
  expect(textsIn(editor, range)).toEqual(['first', 'second'])
  expect(getBlockUnitAt(editor.state.doc, 2)).toBeNull()
})

test('a quote and a table are one block each', () => {
  const editor = makeEditor({type: 'blockquote', content: [p('q1'), p('q2')]}, table2x2())
  expect(nodeNamesIn(editor, getBlockUnitAt(editor.state.doc, posInText(editor, 'q2'))!)).toEqual([
    'blockquote'
  ])
  expect(nodeNamesIn(editor, getBlockUnitAt(editor.state.doc, posInText(editor, 'c4'))!)).toEqual([
    'table'
  ])
})

test('a callout title is never a unit; its body blocks are', () => {
  const editor = makeEditor(callout('Heads up', p('body one'), p('body two')))
  expect(
    nodeNamesIn(editor, getBlockUnitAt(editor.state.doc, posInText(editor, 'Heads up'))!)
  ).toEqual(['callout'])
  expect(
    textsIn(
      editor,
      normalizeBlockRange(
        editor.state.doc,
        posInText(editor, 'body one'),
        posInText(editor, 'body two')
      )!
    )
  ).toEqual(['body one', 'body two'])
})

const nestedList = () =>
  makeEditor({
    type: 'bulletList',
    content: [
      {
        type: 'listItem',
        content: [p('outer1'), {type: 'bulletList', content: [li('in1'), li('in2')]}]
      },
      li('outer2')
    ]
  })

test('nested lists: an inner run stays inner, reaching out grows to the outer items', () => {
  const editor = nestedList()
  const inner = normalizeBlockRange(
    editor.state.doc,
    posInText(editor, 'in1'),
    posInText(editor, 'in2')
  )!
  expect(textsIn(editor, inner)).toEqual(['in1', 'in2'])
  const outer = normalizeBlockRange(
    editor.state.doc,
    posInText(editor, 'in2'),
    posInText(editor, 'outer2')
  )!
  expect(nodeNamesIn(editor, outer)).toEqual(['listItem', 'listItem'])
  expect(countBlocks(editor.state.doc, outer)).toBe(2)
  expect(countBlocks(editor.state.doc, inner)).toBe(2)
  expect(inner.depth).toBeGreaterThan(outer.depth)
})

test('a single unit when anchor equals head', () => {
  const editor = makeEditor(p('one'), p('two'))
  const at = posInText(editor, 'two')
  const range = normalizeBlockRange(editor.state.doc, at, at)!
  expect(textsIn(editor, range)).toEqual(['two'])
  expect(countBlocks(editor.state.doc, range)).toBe(1)
})

test('a task list behaves like a bullet list', () => {
  const task = (text: string) => ({type: 'taskItem', attrs: {checked: false}, content: [p(text)]})
  const editor = makeEditor({type: 'taskList', content: [task('t1'), task('t2'), task('t3')]})
  const range = normalizeBlockRange(
    editor.state.doc,
    posInText(editor, 't1'),
    posInText(editor, 't2')
  )!
  expect(textsIn(editor, range)).toEqual(['t1', 't2'])
})

test('a range entirely inside the title is null', () => {
  const editor = makeEditor(p('first'))
  expect(normalizeBlockRange(editor.state.doc, 2, 3)).toBeNull()
})

test('a title-only doc yields null without throwing', () => {
  const editor = makeEditor()
  expect(normalizeBlockRange(editor.state.doc, 2, 3)).toBeNull()
  expect(normalizeBlockRange(editor.state.doc, 1, editor.state.doc.content.size - 1)).toBeNull()
})

test('toggle summary and table cell resolve to the container', () => {
  const editor = makeEditor(toggle('Summary', p('child')), table2x2())
  expect(
    nodeNamesIn(editor, getBlockUnitAt(editor.state.doc, posInText(editor, 'Summary'))!)
  ).toEqual(['details'])
  expect(nodeNamesIn(editor, getBlockUnitAt(editor.state.doc, posInText(editor, 'c1'))!)).toEqual([
    'table'
  ])
})

test('a list inside a quote resolves to the quote', () => {
  const editor = makeEditor({
    type: 'blockquote',
    content: [{type: 'bulletList', content: [li('ql1'), li('ql2')]}]
  })
  expect(nodeNamesIn(editor, getBlockUnitAt(editor.state.doc, posInText(editor, 'ql1'))!)).toEqual([
    'blockquote'
  ])
})

test('an anchor in a callout title takes the whole callout', () => {
  const editor = makeEditor(callout('Title', p('body')), p('after'))
  const range = normalizeBlockRange(
    editor.state.doc,
    posInText(editor, 'Title'),
    posInText(editor, 'after')
  )!
  expect(nodeNamesIn(editor, range)).toEqual(['callout', 'paragraph'])
})

test('countBlocks works at depth greater than zero', () => {
  const editor = makeEditor(toggle('Notes', p('one'), p('two'), p('three')))
  const range = normalizeBlockRange(
    editor.state.doc,
    posInText(editor, 'one'),
    posInText(editor, 'three')
  )!
  expect(range.depth).toBeGreaterThan(0)
  expect(countBlocks(editor.state.doc, range)).toBe(3)
})

test('isBlockRun accepts callout body blocks and rejects a run starting at the callout title', () => {
  const editor = makeEditor(callout('Heads up', p('x'), p('y')))
  const {doc} = editor.state
  const body = getBlockUnitAt(doc, posInText(editor, 'x'))!
  const titleFrom = doc.resolve(body.from).start()
  expect(isBlockRun(doc, {from: body.from, to: body.to, depth: body.depth})).toBe(true)
  expect(isBlockRun(doc, {from: titleFrom, to: body.to, depth: body.depth})).toBe(false)
})
