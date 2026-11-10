import ms from 'ms'
import {getLiveSession} from './quietReload'

// Chrome also treats a page hidden this long as idle, and starts limiting its timers
const PAUSE_AFTER_HIDDEN_FOR = ms('5m')

// A tab nobody has looked at in a while closes its socket instead of following every update,
// then reconnects and refetches the moment it is visible again
export const createBackgroundSocketPause = (closeSocket: () => void) => {
  let isPaused = false
  let pauseTimer: number | undefined
  const resumeWaiters: (() => void)[] = []

  const pause = () => {
    window.clearTimeout(pauseTimer)
    if (isPaused) return
    isPaused = true
    closeSocket()
  }

  const resume = () => {
    window.clearTimeout(pauseTimer)
    if (!isPaused) return
    isPaused = false
    resumeWaiters.splice(0).forEach((resolve) => resolve())
  }

  const onVisibilityChange = () => {
    if (document.visibilityState !== 'hidden') {
      resume()
      return
    }
    // the others in a meeting see who is in it, so a meeting keeps its socket
    if (isPaused || getLiveSession(window.location.pathname)) return
    window.clearTimeout(pauseTimer)
    pauseTimer = window.setTimeout(pause, PAUSE_AFTER_HIDDEN_FOR)
  }

  document.addEventListener('visibilitychange', onVisibilityChange)
  // Chrome fires freeze before it stops running a hidden page, which could not read its socket anymore
  document.addEventListener('freeze', pause)
  document.addEventListener('resume', onVisibilityChange)
  onVisibilityChange()

  return {
    isPaused: () => isPaused,
    waitUntilResumed: () =>
      isPaused ? new Promise<void>((resolve) => resumeWaiters.push(resolve)) : Promise.resolve()
  }
}
