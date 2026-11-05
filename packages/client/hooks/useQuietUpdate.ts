import {useEffect} from 'react'
import {isClientOutdated, onConnectedServerVersion} from '../utils/connectedServerVersion'
import {reloadQuietly} from '../utils/quietReload'

// Waiting keeps a quick look at another tab from coming back to a loading page, and spreads out the reloads after a deploy
const HIDDEN_RELOAD_MIN_DELAY = 5_000
const HIDDEN_RELOAD_JITTER = 55_000

const useQuietUpdate = () => {
  useEffect(() => {
    // React Router navigates through pushState, so the new build can load at the destination before the old one renders it
    const {history} = window
    const {pushState} = history
    history.pushState = (data, unused, url) => {
      if (url != null) {
        const destination = new URL(url, window.location.href)
        if (destination.pathname !== window.location.pathname && reloadQuietly(destination)) return
      }
      pushState.call(history, data, unused, url)
    }

    let hiddenReloadTimer: number | undefined
    const scheduleHiddenReload = () => {
      window.clearTimeout(hiddenReloadTimer)
      if (document.visibilityState !== 'hidden' || !isClientOutdated()) return
      hiddenReloadTimer = window.setTimeout(
        () => {
          if (document.visibilityState === 'hidden') reloadQuietly()
        },
        HIDDEN_RELOAD_MIN_DELAY + Math.random() * HIDDEN_RELOAD_JITTER
      )
    }
    document.addEventListener('visibilitychange', scheduleHiddenReload)
    const stopListening = onConnectedServerVersion(scheduleHiddenReload)
    return () => {
      history.pushState = pushState
      window.clearTimeout(hiddenReloadTimer)
      document.removeEventListener('visibilitychange', scheduleHiddenReload)
      stopListening()
    }
  }, [])
}

export default useQuietUpdate
