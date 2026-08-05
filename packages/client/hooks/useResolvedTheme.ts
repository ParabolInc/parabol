import {useSyncExternalStore} from 'react'
import type {ResolvedTheme} from '../utils/themePreference'

// ThemeProvider is the only writer: it toggles `theme-dark` on <html> whenever the stored preference
// or the OS setting changes. Watching the class rather than the preference keeps this correct for the
// 'system' preference without re-deriving the media query.
const subscribe = (onStoreChange: () => void) => {
  const observer = new MutationObserver(onStoreChange)
  observer.observe(document.documentElement, {attributes: true, attributeFilter: ['class']})
  return () => observer.disconnect()
}

const getSnapshot = (): ResolvedTheme =>
  document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light'

const getServerSnapshot = (): ResolvedTheme => 'light'

/**
 * The resolved theme, for surfaces CSS can't reach — canvas (chart.js), an imperative library's
 * option object, etc. Anything styleable with Tailwind should use the `bg-surface-*`/`text-fg-*`
 * tokens or a `dark:` variant instead of branching in JS.
 */
const useResolvedTheme = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

export default useResolvedTheme
