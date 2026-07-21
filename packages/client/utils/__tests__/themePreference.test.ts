import {
  getStoredThemePreference,
  isThemePreference,
  resolveTheme,
  setStoredThemePreference
} from '../themePreference'

describe('resolveTheme', () => {
  it('returns the explicit preference regardless of the system setting', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('light', false)).toBe('light')
    expect(resolveTheme('dark', true)).toBe('dark')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('follows the OS for the system preference', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })
})

describe('stored theme preference', () => {
  const store = new Map<string, string>()
  beforeAll(() => {
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: {
          getItem: (key: string) => store.get(key) ?? null,
          setItem: (key: string, value: string) => void store.set(key, value),
          removeItem: (key: string) => void store.delete(key),
          clear: () => store.clear()
        }
      },
      writable: true,
      configurable: true
    })
  })

  beforeEach(() => {
    store.clear()
  })

  it('defaults to system so an untouched install follows the OS', () => {
    expect(getStoredThemePreference()).toBe('system')
  })

  it('defaults to system when the stored value is unrecognized', () => {
    window.localStorage.setItem('theme', 'grape')
    expect(getStoredThemePreference()).toBe('system')
  })

  it('round-trips every preference, including an explicit light', () => {
    setStoredThemePreference('light')
    expect(getStoredThemePreference()).toBe('light')
    setStoredThemePreference('dark')
    expect(getStoredThemePreference()).toBe('dark')
    setStoredThemePreference('system')
    expect(getStoredThemePreference()).toBe('system')
  })
})

describe('isThemePreference', () => {
  it('accepts the three valid preferences', () => {
    expect(isThemePreference('light')).toBe(true)
    expect(isThemePreference('dark')).toBe(true)
    expect(isThemePreference('system')).toBe(true)
  })

  it('rejects anything else', () => {
    expect(isThemePreference(null)).toBe(false)
    expect(isThemePreference(undefined)).toBe(false)
    expect(isThemePreference('')).toBe(false)
    expect(isThemePreference('grape')).toBe(false)
    expect(isThemePreference(1)).toBe(false)
  })
})
