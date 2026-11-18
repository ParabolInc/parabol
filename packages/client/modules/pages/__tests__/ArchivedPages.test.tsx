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

const makeSubPage = (deletedAt: string | null): MockNode => ({
  id: 'page:3',
  title: 'Retro notes',
  isSyncedBlock: false,
  parentPage: {title: 'Team space', deletedAt}
})

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

const clickRestore = (label = 'Restore') => {
  const restore = container.querySelector(`[aria-label="${label}"]`)!
  act(() => {
    restore.dispatchEvent(new MouseEvent('click', {bubbles: true}))
  })
}

test('lists synced blocks under their own heading', () => {
  render([makeBlock(null), runbook])
  const text = container.textContent!
  expect(text.indexOf('Runbook')).toBeGreaterThan(-1)
  expect(text.indexOf('Synced blocks')).toBeGreaterThan(text.indexOf('Runbook'))
  expect(text.indexOf('Escalation path')).toBeGreaterThan(text.indexOf('Synced blocks'))
})

test("a block whose page is in Trash can't be restored yet", () => {
  render([makeBlock('2026-11-15T00:00:00Z')])
  clickRestore('Restore Incident response runbook first')
  expect(mockExecute).not.toHaveBeenCalled()
})

test('a sub-page whose parent is in Trash still restores', () => {
  render([makeSubPage('2026-11-15T00:00:00Z')])
  clickRestore()
  expect(mockExecute).toHaveBeenCalledWith(
    expect.objectContaining({variables: {pageId: 'page:3', action: 'restore'}})
  )
})

test('a block whose page is live restores on click', () => {
  render([makeBlock(null)])
  expect(container.textContent).toContain('From Incident response runbook')
  clickRestore()
  expect(mockExecute).toHaveBeenCalledWith(
    expect.objectContaining({variables: {pageId: 'page:2', action: 'restore'}})
  )
})

test('a refused restore says why, a successful one stays quiet', () => {
  render([makeBlock(null)])
  clickRestore()
  const [{onCompleted}] = mockExecute.mock.calls[0]
  onCompleted({}, null)
  expect(mockEmit).not.toHaveBeenCalled()
  onCompleted({}, [{message: 'Restore the page this block came from first'}])
  expect(mockEmit).toHaveBeenCalledWith(
    'addSnackbar',
    expect.objectContaining({
      key: 'archivedPageRestoreFailed',
      message: 'Restore the page this block came from first'
    })
  )
})
