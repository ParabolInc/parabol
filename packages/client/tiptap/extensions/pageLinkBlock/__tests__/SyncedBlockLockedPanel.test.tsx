import '../../__tests__/installHappyDom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {SyncedBlockLockedPanel} from '../SyncedBlockLockedPanel'

const execute = jest.fn()
const emit = jest.fn()
let authObj: object | null = {sub: 'user'}

jest.mock('../../../../mutations/useRequestPageAccessMutation', () => ({
  useRequestPageAccessMutation: () => [execute, false]
}))
jest.mock('../../../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => ({authObj, eventEmitter: {emit}})
}))

let root: Root
let container: HTMLElement

beforeEach(() => {
  execute.mockReset()
  emit.mockReset()
  authObj = {sub: 'user'}
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => root.render(<SyncedBlockLockedPanel pageCode={7} />))
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

const clickRequest = () =>
  act(() => {
    container.querySelector('button')!.click()
  })
const text = () => container.textContent ?? ''
const REQUESTED = 'Access requested. You can see this block once the owner approves.'

test('asks for this block only and then shows the requested state', () => {
  expect(text()).toContain("You don't have access to this synced block.")
  clickRequest()
  expect(execute).toHaveBeenCalledWith(
    expect.objectContaining({variables: {pageId: 'page:7', reason: '', role: 'viewer'}})
  )
  act(() => execute.mock.calls[0]![0].onCompleted({requestPageAccess: true}, null))
  expect(text()).toContain(REQUESTED)
  expect(container.querySelector('button')).toBeNull()
})

test('an earlier request still shows the requested state', () => {
  clickRequest()
  act(() =>
    execute.mock.calls[0]![0].onCompleted(null, [{extensions: {code: 'TOO_MANY_REQUESTS'}}])
  )
  expect(text()).toContain(REQUESTED)
  expect(emit).not.toHaveBeenCalled()
})

test('a failed request toasts and keeps the button', () => {
  clickRequest()
  act(() => execute.mock.calls[0]![0].onError(new Error('x')))
  expect(emit).toHaveBeenCalledWith(
    'addSnackbar',
    expect.objectContaining({
      message: "Couldn't request access. Try again.",
      key: 'syncedBlockAccessRequestFailed'
    })
  )
  expect(container.querySelector('button')).not.toBeNull()
})

test('a visitor without an account sees no request button', () => {
  authObj = null
  act(() => root.render(<SyncedBlockLockedPanel pageCode={8} />))
  expect(text()).toContain('Part of this page is private.')
  expect(container.querySelector('button')).toBeNull()
})
