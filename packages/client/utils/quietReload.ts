import ms from 'ms'
import {isClientOutdated} from './connectedServerVersion'

const RELOAD_ATTEMPT_STORAGE_KEY = 'parabol:quietReloadAttempt'
const MAX_RELOAD_ATTEMPTS = 3
const FIRST_RETRY_DELAY = ms('5m')
const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit'
])

export interface ReloadAttempt {
  fromVersion: string
  count: number
  at: number
}

export interface PageState {
  pathname: string
  isEditing: boolean
  hasOpenDialog: boolean
  hasUnloadWarning: boolean
}

// A meeting or a demo lives in this page, so reloading would drop the viewer out of it
export const getLiveSession = (pathname: string) => {
  if (pathname.startsWith('/meet/')) return pathname.split('/', 3).join('/')
  if (pathname.startsWith('/retrospective-demo')) return '/retrospective-demo'
  if (pathname.startsWith('/team-health-demo')) return '/team-health-demo'
  return null
}

export const canReloadQuietly = (page: PageState, destinationPathname?: string) => {
  if (page.isEditing || page.hasOpenDialog || page.hasUnloadWarning) return false
  const liveSession = getLiveSession(page.pathname)
  if (!liveSession) return true
  return !!destinationPathname && getLiveSession(destinationPathname) !== liveSession
}

// A reload can bring back the same build, e.g. from a server that has not been replaced yet
export const canAttemptReload = (attempt: ReloadAttempt | null, version: string, now: number) => {
  if (attempt?.fromVersion !== version) return true
  if (attempt.count >= MAX_RELOAD_ATTEMPTS) return false
  return now - attempt.at >= FIRST_RETRY_DELAY * 2 ** (attempt.count - 1)
}

export const nextReloadAttempt = (
  attempt: ReloadAttempt | null,
  version: string,
  now: number
): ReloadAttempt => ({
  fromVersion: version,
  count: attempt?.fromVersion === version ? attempt.count + 1 : 1,
  at: now
})

const isEditable = (element: Element | null) => {
  if (element instanceof HTMLTextAreaElement) return true
  if (element instanceof HTMLInputElement) return !NON_TEXT_INPUT_TYPES.has(element.type)
  return element instanceof HTMLElement && element.isContentEditable
}

const readPageState = (): PageState => ({
  pathname: window.location.pathname,
  isEditing: isEditable(document.activeElement),
  hasOpenDialog: !!document.querySelector('[role="dialog"], [role="alertdialog"]'),
  hasUnloadWarning: !!window.onbeforeunload
})

const readReloadAttempt = (): ReloadAttempt | null => {
  try {
    const storedAttempt = window.sessionStorage.getItem(RELOAD_ATTEMPT_STORAGE_KEY)
    return storedAttempt ? JSON.parse(storedAttempt) : null
  } catch {
    return null
  }
}

const storeReloadAttempt = (attempt: ReloadAttempt) => {
  try {
    window.sessionStorage.setItem(RELOAD_ATTEMPT_STORAGE_KEY, JSON.stringify(attempt))
    return true
  } catch {
    return false
  }
}

// Loads the new build, either here or at the destination of an in-app navigation, when the viewer will not notice
export const reloadQuietly = (destination?: URL) => {
  if (!isClientOutdated() || !canReloadQuietly(readPageState(), destination?.pathname)) return false
  const attempt = readReloadAttempt()
  const now = Date.now()
  if (!canAttemptReload(attempt, __APP_VERSION__, now)) return false
  // without a record of this attempt, nothing would stop a reload loop
  if (!storeReloadAttempt(nextReloadAttempt(attempt, __APP_VERSION__, now))) return false
  if (destination) {
    window.location.assign(destination.href)
  } else {
    window.location.reload()
  }
  return true
}
