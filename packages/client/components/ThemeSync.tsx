import {useEffect, useRef} from 'react'
import {isThemePreference} from '../utils/themePreference'
import {useThemePreference} from './ThemeProvider'

interface Props {
  theme: string
}

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
