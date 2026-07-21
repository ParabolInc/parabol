import {useEffect, useRef} from 'react'
import {isThemePreference} from '../utils/themePreference'
import {useThemePreference} from './ThemeProvider'

interface Props {
  // Relay-generated enums include '%future added value', so accept string and guard
  theme: string
}

/**
 * Adopts the server-persisted theme preference when it arrives or changes
 * (boot reconciliation + live cross-device sync). Deliberately does NOT react
 * to local preference changes: while an updateUserTheme mutation is in flight
 * the local value is newer than the server's, and "server wins" during that
 * window would revert to the stale value and flicker the old theme.
 */
const ThemeSync = (props: Props) => {
  const {theme} = props
  const {preference, setPreference} = useThemePreference()
  const preferenceRef = useRef(preference)
  preferenceRef.current = preference

  useEffect(() => {
    if (isThemePreference(theme) && theme !== preferenceRef.current) {
      setPreference(theme)
    }
  }, [theme, setPreference])

  return null
}

export default ThemeSync
