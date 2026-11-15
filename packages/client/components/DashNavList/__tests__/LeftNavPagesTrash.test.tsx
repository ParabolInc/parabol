import '../../../tiptap/extensions/__tests__/installHappyDom'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import EventEmitter from 'eventemitter3'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {LeftNavPagesTrash} from '../LeftNavPagesTrash'

const eventEmitter = new EventEmitter()

jest.mock('../../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => ({eventEmitter})
}))
jest.mock('../../../modules/pages/ArchivedPagesRoot', () => ({
  ArchivedPagesRoot: () => <div data-archived-pages>Deleted pages</div>
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

const flushFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

test('opens when openPagesTrash fires', async () => {
  act(() =>
    root.render(
      <RadixTooltip.Provider>
        <LeftNavPagesTrash />
      </RadixTooltip.Provider>
    )
  )
  expect(document.body.querySelector('[data-archived-pages]')).toBeNull()
  await act(async () => {
    eventEmitter.emit('openPagesTrash')
    await flushFrame()
  })
  expect(document.body.querySelector('[data-archived-pages]')).not.toBeNull()
})

test('stops listening when it unmounts', () => {
  act(() =>
    root.render(
      <RadixTooltip.Provider>
        <LeftNavPagesTrash />
      </RadixTooltip.Provider>
    )
  )
  expect(eventEmitter.listenerCount('openPagesTrash')).toBe(1)
  act(() => root.render(null))
  expect(eventEmitter.listenerCount('openPagesTrash')).toBe(0)
})
