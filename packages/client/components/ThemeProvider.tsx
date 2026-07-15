import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  applyTheme,
  getStoredThemePreference,
  resolveTheme,
  setStoredThemePreference,
  type ThemePreference
} from '../utils/themePreference'

interface ThemeContextValue {
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export const useThemePreference = () => {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useThemePreference must be used within a ThemeProvider')
  return value
}

export const ThemeProvider = (props: {children: ReactNode}) => {
  const {children} = props
  const [preference, setPreferenceState] = useState<ThemePreference>(getStoredThemePreference)

  const setPreference = useCallback((next: ThemePreference) => {
    setStoredThemePreference(next)
    setPreferenceState(next)
  }, [])

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => applyTheme(resolveTheme(preference, query.matches))
    sync()
    if (preference !== 'system') return
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [preference])

  useEffect(() => {
    // another tab changed the preference
    const onStorage = () => setPreferenceState(getStoredThemePreference())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(() => ({preference, setPreference}), [preference, setPreference])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
