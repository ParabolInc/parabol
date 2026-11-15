import '../../tiptap/extensions/__tests__/installHappyDom'
import EventEmitter from 'eventemitter3'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {useOpenSidebarForPagesTrash} from '../useOpenSidebarForPagesTrash'

const eventEmitter = new EventEmitter()

jest.mock('../useAtmosphere', () => ({
  __esModule: true,
  default: () => ({eventEmitter})
}))

let root: Root
let container: HTMLElement

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

const Probe = ({isOpen, toggle}: {isOpen: boolean; toggle: () => void}) => {
  useOpenSidebarForPagesTrash(isOpen, toggle)
  return null
}

test('opens a closed sidebar when openPagesTrash fires', () => {
  const toggle = jest.fn()
  act(() => root.render(<Probe isOpen={false} toggle={toggle} />))
  act(() => {
    eventEmitter.emit('openPagesTrash')
  })
  expect(toggle).toHaveBeenCalledTimes(1)
})

test('leaves an open sidebar alone', () => {
  const toggle = jest.fn()
  act(() => root.render(<Probe isOpen toggle={toggle} />))
  act(() => {
    eventEmitter.emit('openPagesTrash')
  })
  expect(toggle).not.toHaveBeenCalled()
  expect(eventEmitter.listenerCount('openPagesTrash')).toBe(0)
})
