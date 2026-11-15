import '../../../tiptap/extensions/__tests__/installHappyDom'
import {Provider as TooltipProvider} from '@radix-ui/react-tooltip'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {ArchivedPages} from '../ArchivedPages'

interface MockNode {
  id: string
  title: string
  isSyncedBlock: boolean
  parentPage: {title: string; deletedAt: string | null} | null
}

let mockNodes: MockNode[]
const mockExecute = jest.fn()
const mockEmit = jest.fn()

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () => ({})
}))
jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  usePreloadedQuery: () => ({
    viewer: {archivedPages: {edges: mockNodes.map((node) => ({node}))}}
  })
}))
jest.mock('react-router', () => ({useNavigate: () => jest.fn()}))
jest.mock('../../../mutations/useArchivePageMutation', () => ({
  useArchivePageMutation: () => [mockExecute]
}))
jest.mock('../../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => ({eventEmitter: {emit: mockEmit}})
}))

let root: Root
let container: HTMLElement

beforeEach(() => {
  mockExecute.mockClear()
  mockEmit.mockClear()
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

const runbook: MockNode = {
  id: 'page:1',
  title: 'Runbook',
  isSyncedBlock: false,
  parentPage: null
}

const makeBlock = (deletedAt: string | null): MockNode => ({
  id: 'page:2',
  title: 'Escalation path',
  isSyncedBlock: true,
  parentPage: {title: 'Incident response runbook', deletedAt}
})

const render = (nodes: MockNode[]) => {
  mockNodes = nodes
  act(() =>
    root.render(
      <TooltipProvider>
        <ArchivedPages queryRef={{} as never} />
      </TooltipProvider>
    )
  )
}

test('lists synced blocks under their own heading', () => {
  render([makeBlock(null), runbook])
  const text = container.textContent!
  expect(text.indexOf('Runbook')).toBeGreaterThan(-1)
  expect(text.indexOf('Synced blocks')).toBeGreaterThan(text.indexOf('Runbook'))
  expect(text.indexOf('Escalation path')).toBeGreaterThan(text.indexOf('Synced blocks'))
})

test('names the page each block came from', () => {
  render([makeBlock(null)])
  expect(container.textContent).toContain('From Incident response runbook')
})

test("a block whose page is in Trash can't be restored yet", () => {
  render([makeBlock('2026-11-15T00:00:00Z')])
  const restore = container.querySelector('[aria-label="Restore Incident response runbook first"]')!
  expect(restore).not.toBeNull()
  act(() => {
    restore.querySelector('svg')!.dispatchEvent(new MouseEvent('click', {bubbles: true}))
  })
  expect(mockExecute).not.toHaveBeenCalled()
})

test('a block whose page is live restores on click', () => {
  render([makeBlock(null)])
  const restore = container.querySelector('[aria-label="Restore"]')!
  act(() => {
    restore.querySelector('svg')!.dispatchEvent(new MouseEvent('click', {bubbles: true}))
  })
  expect(mockExecute).toHaveBeenCalledWith(
    expect.objectContaining({variables: {pageId: 'page:2', action: 'restore'}})
  )
})

test('a refused restore says why', () => {
  render([makeBlock(null)])
  const restore = container.querySelector('[aria-label="Restore"]')!
  act(() => {
    restore.querySelector('svg')!.dispatchEvent(new MouseEvent('click', {bubbles: true}))
  })
  const [{onCompleted}] = mockExecute.mock.calls[0]
  onCompleted({}, [{message: 'Restore the page this block came from first'}])
  expect(mockEmit).toHaveBeenCalledWith(
    'addSnackbar',
    expect.objectContaining({
      key: 'archivedPageRestoreFailed',
      message: 'Restore the page this block came from first'
    })
  )
})

test('a restore that works shows no snackbar', () => {
  render([makeBlock(null)])
  const restore = container.querySelector('[aria-label="Restore"]')!
  act(() => {
    restore.querySelector('svg')!.dispatchEvent(new MouseEvent('click', {bubbles: true}))
  })
  const [{onCompleted}] = mockExecute.mock.calls[0]
  onCompleted({}, null)
  expect(mockEmit).not.toHaveBeenCalled()
})

test('shows no heading when Trash holds no blocks', () => {
  render([runbook])
  expect(container.textContent).not.toContain('Synced blocks')
})
