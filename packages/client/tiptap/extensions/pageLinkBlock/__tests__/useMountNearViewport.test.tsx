import '../../__tests__/installHappyDom'
import {act, useRef} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {useMountNearViewport} from '../useMountNearViewport'

type ObserverCallback = (entries: {isIntersecting: boolean}[]) => void
let observerCallback: ObserverCallback | null = null
let observerOptions: IntersectionObserverInit | undefined
let disconnectCount = 0

class MockIntersectionObserver {
  constructor(callback: ObserverCallback, options?: IntersectionObserverInit) {
    observerCallback = callback
    observerOptions = options
  }
  observe() {}
  unobserve() {}
  disconnect() {
    disconnectCount++
  }
}

const originalObserver = globalThis.IntersectionObserver
const MountProbe = () => {
  const ref = useRef<HTMLDivElement>(null)
  const isMounted = useMountNearViewport(ref)
  return <div ref={ref} data-mounted={String(isMounted)} />
}

describe('useMountNearViewport', () => {
  let container: HTMLDivElement
  let root: Root
  const render = () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => root.render(<MountProbe />))
  }
  const mounted = () => container.firstElementChild!.getAttribute('data-mounted') === 'true'
  const intersect = (isIntersecting: boolean) => {
    act(() => observerCallback!([{isIntersecting}]))
  }

  beforeEach(() => {
    observerCallback = null
    observerOptions = undefined
    disconnectCount = 0
    globalThis.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    globalThis.IntersectionObserver = originalObserver
  })

  test('does not mount until the block nears the viewport', () => {
    render()
    expect(mounted()).toBe(false)
    expect(observerOptions?.rootMargin).toBe('100% 0px')
    intersect(false)
    expect(mounted()).toBe(false)
    intersect(true)
    expect(mounted()).toBe(true)
  })

  test('stays mounted after scrolling away and disconnects the observer', () => {
    render()
    intersect(true)
    expect(disconnectCount).toBeGreaterThan(0)
    intersect(false)
    expect(mounted()).toBe(true)
  })

  test('mounts at once without IntersectionObserver', () => {
    // @ts-expect-error simulating a browser without the API
    delete globalThis.IntersectionObserver
    render()
    expect(mounted()).toBe(true)
  })
})
