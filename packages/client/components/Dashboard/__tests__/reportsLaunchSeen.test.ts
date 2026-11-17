import {
  isReportsLaunchGlowActive,
  markReportsLaunchSeen,
  REPORTS_LAUNCH_SEEN_KEY,
  readReportsLaunchSeen
} from '../reportsLaunchSeen'

const stubLocalStorage = (storage: Pick<Storage, 'getItem' | 'setItem'>) => {
  Object.defineProperty(globalThis, 'window', {
    value: {localStorage: storage},
    configurable: true,
    writable: true
  })
}

const mapStorage = () => {
  const map = new Map<string, string>()
  return {
    map,
    storage: {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => {
        map.set(key, value)
      }
    }
  }
}

describe('isReportsLaunchGlowActive', () => {
  const lastMetAt = '2026-11-02T15:00:00.000Z'
  it('glows for someone who has met but not visited Reports before the sunset', () => {
    expect(isReportsLaunchGlowActive(new Date(2026, 10, 11), false, lastMetAt)).toBe(true)
  })
  it('never glows for someone who has never been in a meeting', () => {
    expect(isReportsLaunchGlowActive(new Date(2026, 10, 11), false, null)).toBe(false)
  })
  it('stops once the person has visited Reports', () => {
    expect(isReportsLaunchGlowActive(new Date(2026, 10, 11), true, lastMetAt)).toBe(false)
  })
  it('still glows in the last second of 2026, local time', () => {
    expect(isReportsLaunchGlowActive(new Date(2026, 11, 31, 23, 59, 59), false, lastMetAt)).toBe(
      true
    )
  })
  it('stops at local midnight on Jan 1, 2027', () => {
    expect(isReportsLaunchGlowActive(new Date(2027, 0, 1, 0, 0, 0), false, lastMetAt)).toBe(false)
  })
})

describe('reports launch seen flag', () => {
  const originalWindow = globalThis.window
  afterEach(() => {
    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      configurable: true,
      writable: true
    })
  })

  it('reads false until marked, then true', () => {
    const {map, storage} = mapStorage()
    stubLocalStorage(storage)
    expect(readReportsLaunchSeen()).toBe(false)
    markReportsLaunchSeen()
    expect(map.get(REPORTS_LAUNCH_SEEN_KEY)).toBe('1')
    expect(readReportsLaunchSeen()).toBe(true)
  })

  it('treats unavailable storage as not seen and never throws', () => {
    stubLocalStorage({
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('QuotaExceededError')
      }
    })
    expect(readReportsLaunchSeen()).toBe(false)
    expect(() => markReportsLaunchSeen()).not.toThrow()
  })
})
