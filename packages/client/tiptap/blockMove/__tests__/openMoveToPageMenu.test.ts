import type {Editor} from '@tiptap/core'
import {ReactRenderer} from '@tiptap/react'
import type Atmosphere from '../../../Atmosphere'
import {selectBlockRange} from '../../blockSelection/blockSelectionState'
import type {BlockDragSession} from '../blockDragSession'
import type {BlockDragState} from '../getBlockDropRefusal'
import {type BlockMoveOutcome, moveBlocksToPage} from '../moveBlocksToPage'
import {openMoveToPageMenu} from '../openMoveToPageMenu'
import {prepareBlockMove} from '../prepareBlockMove'
import {showBlockMoveSnack} from '../showBlockMoveSnack'
import {destroyEditors, makeEditor, p, rangeOf} from './blockMoveTestHelpers'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../../hooks/usePageViewerAccess', () => ({lookupPageViewerAccess: () => 'owner'}))
jest.mock('@tiptap/react', () => ({
  ...jest.requireActual('@tiptap/react'),
  ReactRenderer: jest.fn()
}))
jest.mock('../../extensions/moveToPage/MoveToPageMenu', () => ({
  __esModule: true,
  default: () => null
}))
jest.mock('../moveBlocksToPage', () => ({moveBlocksToPage: jest.fn()}))
jest.mock('../showBlockMoveSnack', () => ({showBlockMoveSnack: jest.fn()}))
jest.mock('../prepareBlockMove', () => {
  const actual = jest.requireActual('../prepareBlockMove')
  return {
    ...actual,
    prepareBlockMove: jest.fn((params) => {
      const prepared = actual.prepareBlockMove(params)
      jest.spyOn(prepared.session.range, 'stop')
      return prepared
    })
  }
})

type MenuProps = {
  anchorRect: {top: number; left: number; width: number; height: number}
  count: number
  drag: BlockDragState
  onClose: (returnFocus: boolean) => void
  onPick: (pageId: string, title: string, navigate: (path: string) => void) => void
}
type FakeRenderer = {props: MenuProps; element: HTMLElement; destroy: jest.Mock}
let renderers: FakeRenderer[] = []

const atmosphere = {} as Atmosphere
const anchorRect = {top: 10, left: 20, width: 24, height: 24}
const moved: BlockMoveOutcome = {result: 'moved', meta: null, gap: null, moved: null}
const flush = () => new Promise((resolve) => setTimeout(resolve, 20))

const open = (editor: Editor, range = twoBlocks(editor)) => {
  openMoveToPageMenu({editor, range, anchorRect, pageId: 'page:1', atmosphere})
  const renderer = renderers.at(-1)!
  const session: BlockDragSession = jest.mocked(prepareBlockMove).mock.results.at(-1)!.value.session
  return {renderer, session}
}
const twoBlocks = (editor: Editor) => {
  const first = rangeOf(editor, 'paragraph', 0)
  const second = rangeOf(editor, 'paragraph', 1)
  return {from: first.from, to: second.to, depth: 0}
}

beforeEach(() => {
  jest.mocked(ReactRenderer).mockImplementation((_component, {props}) => {
    const element = document.body.appendChild(document.createElement('div'))
    const renderer = {props: props as MenuProps, element, destroy: jest.fn()}
    renderers.push(renderer)
    return renderer as unknown as ReactRenderer
  })
})

afterEach(() => {
  jest.clearAllMocks()
  renderers = []
  destroyEditors()
  document.body.replaceChildren()
})

test('mounts the picker with the block count and drag state at the anchor', () => {
  const editor = makeEditor(p('a'), p('b'), p('c'))
  const {renderer} = open(editor)
  expect(renderer.element.isConnected).toBe(true)
  expect(renderer.props).toMatchObject({
    anchorRect,
    count: 2,
    drag: {sourcePageId: 'page:1', childPageIds: [], refusal: null}
  })
})

test('closing the picker without a pick stops tracking and restores focus', async () => {
  const editor = makeEditor(p('a'), p('b'), p('c'))
  const range = twoBlocks(editor)
  selectBlockRange(editor, range)
  const doc = editor.state.doc
  const selection = editor.state.selection
  const focus = jest.spyOn(editor.view, 'focus')
  const {renderer, session} = open(editor, range)
  renderer.props.onClose(true)
  await flush()
  expect(session.range.stop).toHaveBeenCalled()
  expect(renderer.destroy).toHaveBeenCalled()
  expect(renderer.element.isConnected).toBe(false)
  expect(focus).toHaveBeenCalled()
  expect(editor.state.doc.eq(doc)).toBe(true)
  expect(editor.state.selection.eq(selection)).toBe(true)
  expect(moveBlocksToPage).not.toHaveBeenCalled()
})

test('picking a page runs the move and shows its snackbar', async () => {
  const editor = makeEditor(p('a'), p('b'), p('c'))
  const {renderer, session} = open(editor)
  const navigate = jest.fn()
  jest.mocked(moveBlocksToPage).mockImplementation(async () => {
    expect(renderer.destroy).toHaveBeenCalled()
    return moved
  })
  renderer.props.onPick('page:9', 'Q3 Roadmap', navigate)
  await flush()
  expect(moveBlocksToPage).toHaveBeenCalledWith({
    session,
    targetPageId: 'page:9',
    targetTitle: 'Q3 Roadmap'
  })
  expect(showBlockMoveSnack).toHaveBeenCalledWith({
    atmosphere,
    editor,
    navigate,
    outcome: moved,
    count: 2,
    targetPageId: 'page:9',
    targetTitle: 'Q3 Roadmap'
  })
  expect(session.range.stop).not.toHaveBeenCalled()
  renderer.props.onClose(true)
  expect(session.range.stop).not.toHaveBeenCalled()
})

test('closing on a click into another control stops tracking but leaves focus there', async () => {
  const editor = makeEditor(p('a'), p('b'))
  const focus = jest.spyOn(editor.view, 'focus')
  const {renderer, session} = open(editor)
  renderer.props.onClose(false)
  await flush()
  expect(session.range.stop).toHaveBeenCalled()
  expect(renderer.destroy).toHaveBeenCalled()
  expect(focus).not.toHaveBeenCalled()
})

test('a failed move is logged and shows no snackbar', async () => {
  const error = new Error('boom')
  jest.mocked(moveBlocksToPage).mockRejectedValue(error)
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
  const editor = makeEditor(p('a'), p('b'))
  const {renderer} = open(editor)
  renderer.props.onPick('page:9', 'Q3 Roadmap', jest.fn())
  await flush()
  expect(consoleError).toHaveBeenCalledWith(error)
  expect(showBlockMoveSnack).not.toHaveBeenCalled()
  consoleError.mockRestore()
})

test('opening a second picker closes the first', () => {
  const editor = makeEditor(p('a'), p('b'), p('c'))
  const first = open(editor)
  const second = open(editor)
  expect(first.renderer.destroy).toHaveBeenCalled()
  expect(first.session.range.stop).toHaveBeenCalled()
  expect(second.renderer.destroy).not.toHaveBeenCalled()
})

test('the picker closes when the editor is destroyed', () => {
  const editor = makeEditor(p('a'), p('b'))
  const {renderer, session} = open(editor)
  editor.destroy()
  expect(renderer.destroy).toHaveBeenCalled()
  expect(session.range.stop).toHaveBeenCalled()
})
