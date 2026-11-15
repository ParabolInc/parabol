import type Atmosphere from '../../../Atmosphere'
import {getBlockDragState, prepareBlockMove} from '../prepareBlockMove'
import {destroyEditors, link, makeEditor, p, rangeOf} from './blockMoveTestHelpers'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../../hooks/usePageViewerAccess', () => ({
  lookupPageViewerAccess: (_env: unknown, pageCode: number) => (pageCode === 7 ? 'editor' : 'owner')
}))

afterEach(destroyEditors)

const atmosphere = {} as unknown as Atmosphere

test('prepareBlockMove tracks the range and counts its blocks', () => {
  const editor = makeEditor(p('a'), p('b'), p('c'))
  const first = rangeOf(editor, 'paragraph', 0)
  const second = rangeOf(editor, 'paragraph', 1)
  const range = {from: first.from, to: second.to, depth: 0}
  const {session, refusal} = prepareBlockMove({editor, range, pageId: 'page:1', atmosphere})
  expect(session.count).toBe(2)
  expect(refusal).toBeNull()
  expect(session.range.current()).toEqual({from: range.from, to: range.to})
})

test('prepareBlockMove refuses a run holding a child page the viewer does not own', () => {
  const editor = makeEditor(link(7, 'Specs', true))
  const {from, to} = rangeOf(editor, 'pageLinkBlock', 0)
  const {session, refusal} = prepareBlockMove({
    editor,
    range: {from, to, depth: 0},
    pageId: 'page:1',
    atmosphere
  })
  expect(refusal).toBe('Only its owner can move Specs')
  expect(getBlockDragState(session, refusal)).toEqual({
    sourcePageId: 'page:1',
    childPageIds: ['page:7'],
    refusal: 'Only its owner can move Specs'
  })
})
