import '../extensions/__tests__/installHappyDom'
import {keepArrivalInView} from '../keepArrivalInView'

let resize: () => void = () => {}
const disconnect = jest.fn()
class FakeResizeObserver {
  constructor(callback: () => void) {
    resize = callback
  }
  observe() {}
  disconnect = disconnect
}

const makeBlock = () => {
  const block = document.createElement('div')
  block.scrollIntoView = jest.fn()
  return block
}

let stop: () => void = () => {}
beforeEach(() => {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    value: FakeResizeObserver,
    configurable: true,
    writable: true
  })
})

afterEach(() => {
  stop()
  jest.restoreAllMocks()
  jest.clearAllMocks()
})

test('centers the block at once and again whenever the page grows', () => {
  const block = makeBlock()
  stop = keepArrivalInView(() => block, document.createElement('div'), 10_000)
  expect(block.scrollIntoView).toHaveBeenCalledWith({block: 'center'})
  resize()
  expect(block.scrollIntoView).toHaveBeenCalledTimes(2)
})

test.each(['wheel', 'touchstart', 'keydown', 'pointerdown'])(
  'lets go once the reader acts (%s)',
  (type) => {
    const block = makeBlock()
    stop = keepArrivalInView(() => block, document.createElement('div'), 10_000)
    window.dispatchEvent(new Event(type))
    expect(disconnect).toHaveBeenCalled()
  }
)

test('lets go after its time is up', () => {
  const setTimeoutSpy = jest.spyOn(window, 'setTimeout')
  const block = makeBlock()
  stop = keepArrivalInView(() => block, document.createElement('div'), 10_000)
  const [timeUp, delay] = setTimeoutSpy.mock.calls[0]!
  expect(delay).toBe(10_000)
  ;(timeUp as () => void)()
  expect(disconnect).toHaveBeenCalled()
})
