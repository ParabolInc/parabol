import '../../__tests__/installHappyDom'
import type {Editor, JSONContent} from '@tiptap/core'
import {NodeSelection} from '@tiptap/pm/state'
import {
  destroyEditors,
  makeEditor,
  p,
  rangeOf
} from '../../../blockMove/__tests__/blockMoveTestHelpers'
import {getSelectedBlockRange, selectBlockRange} from '../../../blockSelection/blockSelectionState'
import {getPageToDuplicate} from '../getPageToDuplicate'

const link = (attrs: Record<string, unknown>): JSONContent => ({type: 'pageLinkBlock', attrs})
const canonicalLink = link({pageCode: 11, canonical: true, title: 'Plan'})
const linkPos = (editor: Editor) => rangeOf(editor, 'pageLinkBlock', 0).from

afterEach(destroyEditors)

test('a single canonical page link is duplicable', () => {
  const editor = makeEditor(p('intro'), canonicalLink)
  expect(getPageToDuplicate(editor.state, {pos: linkPos(editor)})).toEqual({
    pageCode: 11,
    title: 'Plan'
  })
})

test('a node selection on a canonical page link is duplicable', () => {
  const editor = makeEditor(p('intro'), canonicalLink)
  editor.view.dispatch(
    editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, linkPos(editor)))
  )
  expect(getPageToDuplicate(editor.state, {selection: true})).toEqual({
    pageCode: 11,
    title: 'Plan'
  })
})

test('a reference link is not', () => {
  const editor = makeEditor(p('intro'), link({pageCode: 11, canonical: false, title: 'Plan'}))
  expect(getPageToDuplicate(editor.state, {pos: linkPos(editor)})).toBeNull()
})

test('a synced block is not', () => {
  const editor = makeEditor(p('intro'), link({pageCode: 11, canonical: true, synced: true}))
  expect(getPageToDuplicate(editor.state, {pos: linkPos(editor)})).toBeNull()
})

test('a link without a valid page code is not', () => {
  const editor = makeEditor(p('intro'), link({pageCode: 0, canonical: true, title: 'Plan'}))
  expect(getPageToDuplicate(editor.state, {pos: linkPos(editor)})).toBeNull()
})

test('a paragraph is not', () => {
  const editor = makeEditor(p('intro'), canonicalLink)
  expect(getPageToDuplicate(editor.state, {pos: rangeOf(editor, 'paragraph', 0).from})).toBeNull()
})

test('a multi-block selection is not', () => {
  const editor = makeEditor(p('intro'), canonicalLink)
  const paragraph = rangeOf(editor, 'paragraph', 0)
  const pageLink = rangeOf(editor, 'pageLinkBlock', 0)
  selectBlockRange(editor, {from: paragraph.from, to: pageLink.to, depth: 0})
  expect(getSelectedBlockRange(editor.state)).not.toBeNull()
  expect(getPageToDuplicate(editor.state, {selection: true})).toBeNull()
})

test('a block selection elsewhere does not hide the hovered page link', () => {
  const editor = makeEditor(p('intro'), canonicalLink)
  const paragraph = rangeOf(editor, 'paragraph', 0)
  selectBlockRange(editor, {from: paragraph.from, to: paragraph.to, depth: 0})
  expect(getSelectedBlockRange(editor.state)).not.toBeNull()
  expect(getPageToDuplicate(editor.state, {pos: linkPos(editor)})).toEqual({
    pageCode: 11,
    title: 'Plan'
  })
  expect(getPageToDuplicate(editor.state, {selection: true})).toBeNull()
})
