import type {Editor} from '@tiptap/core'
import type Atmosphere from '../../../Atmosphere'
import {prepareBlockDrag} from '../prepareBlockDrag'
import {destroyEditors, link, makeEditor, p, rangeOf, toggle} from './blockMoveTestHelpers'

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
