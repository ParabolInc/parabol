import {happyWindow} from '../../extensions/__tests__/installHappyDom'
import {fingerprintBlocks} from '../fingerprintBlocks'
import {getMovableBlocks} from '../getMovableBlocks'
import {destroyEditors, li, link, makeEditor, p, rangeOf, toggle} from './blockMoveTestHelpers'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))

afterEach(() => {
  destroyEditors()
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

test('returns a paragraph as one block', () => {
  const editor = makeEditor(p('alpha'), p('beta'))
  const {from, to} = rangeOf(editor, 'paragraph', 0)
  expect(getMovableBlocks(editor.state.doc, from, to)).toEqual({
    blocks: [p('alpha')],
    childPages: [],
    hasUpload: false
  })
})

test('wraps a single list item in its list type, numbered from 1', () => {
  const editor = makeEditor({
    type: 'orderedList',
    attrs: {start: 3},
    content: [li('one'), li('two')]
  })
  const {from, to} = rangeOf(editor, 'listItem', 1)
  const {blocks} = getMovableBlocks(editor.state.doc, from, to)
  expect(blocks).toEqual([{type: 'orderedList', content: [li('two')]}])
})

test('lists canonical child pages nested in a toggle and skips plain and optimistic links', () => {
  const editor = makeEditor(
    toggle('Notes', link(7, 'Hiring plan', true), link(8, 'Ref', false), link(-1, 'New', true))
  )
  const {from, to} = rangeOf(editor, 'details', 0)
  expect(getMovableBlocks(editor.state.doc, from, to).childPages).toEqual([
    {pageCode: 7, title: 'Hiring plan'}
  ])
})

test('flags a file that is still uploading', () => {
  const editor = makeEditor({type: 'fileUpload'})
  const {from, to} = rangeOf(editor, 'fileUpload', 0)
  expect(getMovableBlocks(editor.state.doc, from, to).hasUpload).toBe(true)
})

test('fingerprints ignore listed page links but nothing else', () => {
  const withLink = [toggle('Notes', p('x'), link(7, 'Hiring plan', true))]
  const without = [toggle('Notes', p('x'))]
  const ignore = new Set([7])
  expect(fingerprintBlocks(withLink, ignore)).toBe(fingerprintBlocks(without, ignore))
  expect(fingerprintBlocks([toggle('Notes', p('y'))], ignore)).not.toBe(
    fingerprintBlocks(without, ignore)
  )
})
