const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

describe('getTabSessionId', () => {
  const store = new Map<string, string>()
  const sessionStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value)
  }

  beforeEach(() => {
    store.clear()
    jest.resetModules()
    Object.defineProperty(globalThis, 'window', {
      value: {sessionStorage},
      writable: true,
      configurable: true
    })
  })

  it('keeps one id for the life of the tab and stores it', async () => {
    const {default: getTabSessionId} = await import('../getTabSessionId')
    const sessionId = getTabSessionId()
    expect(sessionId).toMatch(UUID)
    expect(getTabSessionId()).toBe(sessionId)
    expect([...store.values()]).toEqual([sessionId])
  })

  it('keeps the id across a reload of the same tab', async () => {
    store.set('parabol:tabSessionId', 'tab-before-reload')
    const {default: getTabSessionId} = await import('../getTabSessionId')
    expect(getTabSessionId()).toBe('tab-before-reload')
  })

  it('still returns an id when sessionStorage is blocked', async () => {
    Object.defineProperty(globalThis, 'window', {
      value: {
        get sessionStorage() {
          throw new Error('SecurityError')
        }
      },
      writable: true,
      configurable: true
    })
    const {default: getTabSessionId} = await import('../getTabSessionId')
    expect(getTabSessionId()).toMatch(UUID)
  })
})
