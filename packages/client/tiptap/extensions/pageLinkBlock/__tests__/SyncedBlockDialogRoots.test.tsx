import '../../__tests__/installHappyDom'
import {MotionGlobalConfig} from 'motion/react'
import {act, type ReactNode} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import type {SyncedBlockDialogRows} from '../getSyncedBlockDialogRows'
import {SyncedBlockDeleteAllDialogRoot} from '../SyncedBlockDeleteAllDialogRoot'
import {SyncedBlockUnsyncAllDialogRoot} from '../SyncedBlockUnsyncAllDialogRoot'

MotionGlobalConfig.skipAnimations = true

interface MutationConfig {
  variables: Record<string, unknown>
  onCompleted: (res: unknown, errors: {message: string}[] | null) => void
  onError: (error: {message: string}) => void
}

const mockEmit = jest.fn()
const mockArchive = jest.fn<void, [MutationConfig]>()
const mockUnsync = jest.fn<void, [MutationConfig]>()
const mockRows: SyncedBlockDialogRows = {
  pageCount: 3,
  originalTitle: 'Runbook',
  deleteRows: [{key: 'page:1', icon: 'page', title: 'Runbook', isThisPage: true}],
  unsyncRows: [
    {key: 'page:1', icon: 'page', title: 'Runbook', note: 'Keeps its text', isThisPage: true}
  ]
}

jest.mock('../../../../components/ErrorComponent/ErrorComponent', () => ({
  __esModule: true,
  default: () => null
}))
jest.mock('../../../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => ({eventEmitter: {emit: mockEmit}})
}))
jest.mock('../../../../hooks/useQueryLoaderNow', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../../../mutations/useArchivePageMutation', () => ({
  useArchivePageMutation: () => [mockArchive, false]
}))
jest.mock('../../../../mutations/useUnsyncSyncedBlockMutation', () => ({
  useUnsyncSyncedBlockMutation: () => [mockUnsync, false]
}))
jest.mock('../SyncedBlockDialogRowsLoader', () => ({
  SyncedBlockDialogRowsLoader: ({onRows}: {onRows: (rows: SyncedBlockDialogRows) => void}) => {
    const {useEffect} = jest.requireActual<typeof import('react')>('react')
    useEffect(() => onRows(mockRows), [onRows])
    return null
  }
}))

let root: Root
let container: HTMLElement

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  mockEmit.mockClear()
  mockArchive.mockClear()
  mockUnsync.mockClear()
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

const render = (node: ReactNode) => act(() => root.render(node))
const click = (label: string) =>
  act(() =>
    Array.from(document.body.querySelectorAll<HTMLElement>('[role="dialog"] button'))
      .find((button) => button.textContent === label)!
      .click()
  )
const snacks = () =>
  mockEmit.mock.calls.filter(([name]) => name === 'addSnackbar').map(([, snack]) => snack)
const errorSnack = {key: 'mutationError:Nope', message: 'Nope', autoDismiss: 5}

const renderDeleteAll = () => {
  const onClose = jest.fn()
  render(
    <SyncedBlockDeleteAllDialogRoot
      pageCode={7}
      currentPageId='page:1'
      hostTitle='Runbook'
      onClose={onClose}
      onCloseAutoFocus={jest.fn()}
    />
  )
  click('Delete all')
  return {onClose, config: mockArchive.mock.calls[0]![0]}
}

const renderUnsyncAll = () => {
  const onClose = jest.fn()
  render(
    <SyncedBlockUnsyncAllDialogRoot
      pageCode={7}
      currentPageId='page:1'
      onClose={onClose}
      onCloseAutoFocus={jest.fn()}
    />
  )
  click('Unsync all')
  return {onClose, config: mockUnsync.mock.calls[0]![0]}
}

test('Delete all closes and offers to view Trash', () => {
  const {onClose, config} = renderDeleteAll()
  expect(config.variables).toEqual({pageId: 'page:7', action: 'archive'})
  act(() => config.onCompleted({}, null))
  expect(onClose).toHaveBeenCalledTimes(1)
  expect(snacks()).toEqual([
    {
      key: 'SyncedBlockDeletedAll',
      autoDismiss: 10,
      message: 'Deleted from 3 pages and moved to Trash.',
      action: {label: 'View Trash', callback: expect.any(Function)}
    }
  ])
  snacks()[0].action.callback()
  expect(mockEmit).toHaveBeenLastCalledWith('openPagesTrash')
})

test('Delete all closes with the error when the server refuses', () => {
  const {onClose, config} = renderDeleteAll()
  act(() => config.onCompleted(null, [{message: 'Nope'}]))
  expect(onClose).toHaveBeenCalledTimes(1)
  expect(snacks()).toEqual([errorSnack])
})

test('Delete all closes with the error when the request fails', () => {
  const {onClose, config} = renderDeleteAll()
  act(() => config.onError({message: 'Nope'}))
  expect(onClose).toHaveBeenCalledTimes(1)
  expect(snacks()).toEqual([errorSnack])
})

test('Unsync all closes without a snack', () => {
  const {onClose, config} = renderUnsyncAll()
  expect(config.variables).toEqual({pageId: 'page:7'})
  act(() => config.onCompleted({}, null))
  expect(onClose).toHaveBeenCalledTimes(1)
  expect(snacks()).toEqual([])
})

test('Unsync all closes with the error when the server refuses', () => {
  const {onClose, config} = renderUnsyncAll()
  act(() => config.onCompleted(null, [{message: 'Nope'}]))
  expect(onClose).toHaveBeenCalledTimes(1)
  expect(snacks()).toEqual([errorSnack])
})

test('Unsync all closes with the error when the request fails', () => {
  const {onClose, config} = renderUnsyncAll()
  act(() => config.onError({message: 'Nope'}))
  expect(onClose).toHaveBeenCalledTimes(1)
  expect(snacks()).toEqual([errorSnack])
})
