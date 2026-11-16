import '../../tiptap/extensions/__tests__/installHappyDom'
import type {Editor} from '@tiptap/core'
import {act, createElement} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {MemoryRouter, useNavigate} from 'react-router'
import {setPendingArrival, takePendingArrival} from '../../tiptap/blockMove/pendingArrivals'
import {clearBlockArrival, showBlockArrival} from '../../tiptap/extensions/BlockArrival'
import {findSyncedBlockPositions} from '../../tiptap/extensions/pageLinkBlock/findSyncedBlockPositions'
import {isArrivalPending, useArrivalHighlight} from '../useArrivalHighlight'

jest.mock('../../tiptap/extensions/BlockArrival', () => ({
  showBlockArrival: jest.fn(),
  clearBlockArrival: jest.fn()
}))
jest.mock('../../tiptap/extensions/pageLinkBlock/findSyncedBlockPositions', () => ({
  findSyncedBlockPositions: jest.fn()
}))
jest.mock('../../tiptap/blockMove/findMovedBlockPositions', () => ({
  findMovedBlockPositions: jest.fn(() => [42])
}))

const mockFind = jest.mocked(findSyncedBlockPositions)

let root: Root
let container: HTMLElement

let navigateTo: (to: string) => void = () => {}
const Probe = ({editor}: {editor: Editor}) => {
  useArrivalHighlight(editor, 'page:1')
  const navigate = useNavigate()
  navigateTo = navigate
  return null
}
const mount = (editor: Editor, hash = '') =>
  act(() =>
    root.render(
      createElement(
        MemoryRouter,
        {initialEntries: [`/pages/runbook-1${hash}`]},
        createElement(Probe, {editor})
      )
    )
  )

const makeEditor = () => {
  const scrollIntoView = jest.fn()
  const dom = document.createElement('div')
  dom.scrollIntoView = scrollIntoView
  const listeners = new Set<() => void>()
  const editor = {
    isDestroyed: false,
    state: {doc: {}},
    view: {nodeDOM: jest.fn(() => dom), dom: document.createElement('div')},
    on: (_event: string, fn: () => void) => listeners.add(fn),
    off: (_event: string, fn: () => void) => listeners.delete(fn)
  }
  return {
    editor: editor as unknown as Editor,
    scrollIntoView,
    update: () => listeners.forEach((fn) => fn())
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  takePendingArrival('page:1')
  act(() => root.unmount())
  container.remove()
})

test('highlights the synced block named in the URL', () => {
  mockFind.mockReturnValue([5, 30])
  const {editor, scrollIntoView} = makeEditor()
  mount(editor, '#synced-block-9')
  expect(mockFind).toHaveBeenCalledWith(editor.state.doc, 9)
  expect(showBlockArrival).toHaveBeenCalledWith(editor.view, [5])
  expect(scrollIntoView).toHaveBeenCalledWith({block: 'center'})
})

test('waits for the block to arrive in the doc', () => {
  mockFind.mockReturnValue([])
  const {editor, update} = makeEditor()
  mount(editor, '#synced-block-9')
  expect(showBlockArrival).not.toHaveBeenCalled()
  mockFind.mockReturnValue([7])
  act(update)
  expect(showBlockArrival).toHaveBeenCalledWith(editor.view, [7])
})

test('a pending move still wins', () => {
  setPendingArrival('page:1', [{client: 1, clock: 1, snapshot: ''}])
  const {editor} = makeEditor()
  mount(editor, '#synced-block-9')
  expect(mockFind).not.toHaveBeenCalled()
  expect(showBlockArrival).toHaveBeenCalledWith(editor.view, [42])
})

test('does nothing without a move or a block hash', () => {
  const {editor} = makeEditor()
  mount(editor)
  expect(showBlockArrival).not.toHaveBeenCalled()
  expect(clearBlockArrival).not.toHaveBeenCalled()
})

test('a new block hash on the open page highlights the new block', () => {
  mockFind.mockReturnValue([5])
  const {editor} = makeEditor()
  mount(editor)
  expect(showBlockArrival).not.toHaveBeenCalled()
  mockFind.mockReturnValue([11])
  act(() => navigateTo('/pages/runbook-1#synced-block-4'))
  expect(mockFind).toHaveBeenLastCalledWith(editor.state.doc, 4)
  expect(showBlockArrival).toHaveBeenLastCalledWith(editor.view, [11])
})

test('a pending move or a block hash keeps the caret out of the title', () => {
  expect(isArrivalPending('page:1', '#synced-block-9')).toBe(true)
  setPendingArrival('page:1', [{client: 1, clock: 1, snapshot: ''}])
  expect(isArrivalPending('page:1', '')).toBe(true)
  takePendingArrival('page:1')
  expect(isArrivalPending('page:1', '')).toBe(false)
})
