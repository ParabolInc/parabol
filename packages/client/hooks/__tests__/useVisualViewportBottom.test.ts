import {subscribeVisualViewportBottom, visualViewportBottom} from '../useVisualViewportBottom'

describe('visualViewportBottom', () => {
  it('returns 0 when the viewport fills the window', () => {
    expect(visualViewportBottom(800, 800, 0)).toBe(0)
  })

  it('returns the gap left by a software keyboard', () => {
    expect(visualViewportBottom(800, 500, 0)).toBe(300)
  })

  it('accounts for a scrolled offsetTop', () => {
    expect(visualViewportBottom(800, 500, 20)).toBe(280)
  })

  it('clamps a negative result to 0', () => {
    expect(visualViewportBottom(800, 850, 0)).toBe(0)
  })

  it('rounds a fractional result', () => {
    expect(visualViewportBottom(800.6, 500.2, 0)).toBe(300)
  })
})

describe('subscribeVisualViewportBottom', () => {
  const makeFakeWindow = () => {
    const listeners: Record<string, () => void> = {}
    const visualViewport = {
      height: 500,
      offsetTop: 0,
      addEventListener: jest.fn((type: string, handler: () => void) => {
        listeners[type] = handler
      }),
      removeEventListener: jest.fn((type: string) => {
        delete listeners[type]
      })
    }
    const fakeWindow = {
      innerHeight: 800,
      visualViewport,
      requestAnimationFrame: jest.fn((cb: () => void) => {
        cb()
        return 1
      }),
      cancelAnimationFrame: jest.fn()
    }
    return {fakeWindow, visualViewport, listeners}
  }

  const withFakeWindow = (
    fakeWindow: ReturnType<typeof makeFakeWindow>['fakeWindow'],
    run: () => void
  ) => {
    const original = global.window
    global.window = fakeWindow as unknown as typeof window
    try {
      run()
    } finally {
      global.window = original
    }
  }

  it('does not subscribe when disabled', () => {
    const {fakeWindow, visualViewport} = makeFakeWindow()
    withFakeWindow(fakeWindow, () => {
      const setBottom = jest.fn()
      const cleanup = subscribeVisualViewportBottom(false, setBottom)
      expect(visualViewport.addEventListener).not.toHaveBeenCalled()
      expect(setBottom).toHaveBeenCalledWith(0)
      expect(cleanup).toBeUndefined()
    })
  })

  it('subscribes to resize and scroll when enabled', () => {
    const {fakeWindow, visualViewport} = makeFakeWindow()
    withFakeWindow(fakeWindow, () => {
      const setBottom = jest.fn()
      subscribeVisualViewportBottom(true, setBottom)
      expect(visualViewport.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
      expect(visualViewport.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
      expect(setBottom).toHaveBeenCalledWith(300)
    })
  })

  it('removes listeners when disabled after being enabled', () => {
    const {fakeWindow, visualViewport} = makeFakeWindow()
    withFakeWindow(fakeWindow, () => {
      const cleanup = subscribeVisualViewportBottom(true, jest.fn())
      cleanup?.()
      expect(visualViewport.removeEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      )
      expect(visualViewport.removeEventListener).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )
    })
  })
})
