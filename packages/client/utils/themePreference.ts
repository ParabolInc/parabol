import {PALETTE} from '../styles/paletteV3'
import {LocalStorageKey} from '../types/constEnums'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const THEME_PREFERENCES: readonly ThemePreference[] = ['light', 'dark', 'system']

export const isThemePreference = (value: unknown): value is ThemePreference =>
  THEME_PREFERENCES.includes(value as ThemePreference)

export const resolveTheme = (
  preference: ThemePreference,
  systemPrefersDark: boolean
): ResolvedTheme => {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light'
  return preference
}

// Dark mode is feature-flagged, and the theme is applied above Relay (Root.tsx) where the
// flag isn't readable. So the default must be the opted-out theme: users only ever reach
// dark by explicitly choosing 'dark' or 'system', which the flagged Appearance panel gates.
const DEFAULT_THEME_PREFERENCE: ThemePreference = 'light'

export const getStoredThemePreference = (): ThemePreference => {
  try {
    const stored = window.localStorage.getItem(LocalStorageKey.THEME)
    return isThemePreference(stored) ? stored : DEFAULT_THEME_PREFERENCE
  } catch {
    return DEFAULT_THEME_PREFERENCE
  }
}

export const setStoredThemePreference = (preference: ThemePreference) => {
  try {
    // 'system' is persisted explicitly: an absent key now means light, so removing the
    // key would silently downgrade a deliberate "follow my OS" choice to light.
    window.localStorage.setItem(LocalStorageKey.THEME, preference)
  } catch {
    // localStorage unavailable (e.g. private mode) — theme just won't persist
  }
}

export const applyTheme = (theme: ResolvedTheme) => {
  document.documentElement.classList.toggle('theme-dark', theme === 'dark')
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? PALETTE.GRAPE_800 : PALETTE.GRAPE_700)
}
