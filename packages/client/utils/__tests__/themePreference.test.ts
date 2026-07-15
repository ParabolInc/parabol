import {isThemePreference, resolveTheme} from '../themePreference'

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
