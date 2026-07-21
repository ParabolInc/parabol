import {useEffect, useRef} from 'react'
import {isThemePreference} from '../utils/themePreference'
import {useThemePreference} from './ThemeProvider'

interface Props {
  // Relay-generated enums include '%future added value', so accept string and guard
  theme: string
  // viewer's `darkMode` feature flag
  enabled: boolean
}

/**
 * Adopts the server-persisted theme preference when it arrives or changes
 * (boot reconciliation + live cross-device sync). Deliberately does NOT react
 * to local preference changes: while an updateUserTheme mutation is in flight
 * the local value is newer than the server's, and "server wins" during that
 * window would revert to the stale value and flicker the old theme.
 *
 * Gated on the `darkMode` flag: User.theme defaults to 'system' in the database,
 * so without this an unflagged viewer on a dark OS would have that default synced
 * down and land in the unreleased theme with no Appearance panel to escape it.
 */
const ThemeSync = (props: Props) => {
  const {theme, enabled} = props
  const {preference, setPreference} = useThemePreference()
  const preferenceRef = useRef(preference)
  preferenceRef.current = preference

  useEffect(() => {
    if (!enabled) {
      // the flag is authoritative: a viewer who picked dark and then lost the flag would
      // otherwise stay dark forever, since the Appearance panel is gone with it
      if (preferenceRef.current !== 'light') setPreference('light')
      return
    }
    if (isThemePreference(theme) && theme !== preferenceRef.current) {
      setPreference(theme)
    }
  }, [theme, enabled, setPreference])

  return null
}

export default ThemeSync
