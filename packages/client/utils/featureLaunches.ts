// A feature launch highlights something new until the viewer clicks it or the launch ends.
// Clicks are remembered per browser in localStorage, under the key `${id}LaunchSeen`
export const FEATURE_LAUNCHES = {
  reports: {endsAt: new Date(2027, 0, 1)},
  teamHealthInRetro: {endsAt: new Date(2027, 0, 1)}
} satisfies Record<string, {endsAt: Date}>

export type FeatureLaunchId = keyof typeof FEATURE_LAUNCHES

const SEEN_SUFFIX = 'LaunchSeen'
const getSeenKey = (id: FeatureLaunchId) => `${id}${SEEN_SUFFIX}`

// keeps a click for this session when localStorage is unavailable, e.g. blocked site data
const seenThisSession = new Set<FeatureLaunchId>()
const listeners = new Set<() => void>()

const isFeatureLaunchSeen = (id: FeatureLaunchId) => {
  if (seenThisSession.has(id)) return true
  try {
    return !!window.localStorage.getItem(getSeenKey(id))
  } catch {
    return false
  }
}

export const isFeatureLaunchLive = (id: FeatureLaunchId, now: Date) =>
  now < FEATURE_LAUNCHES[id].endsAt && !isFeatureLaunchSeen(id)

export const markFeatureLaunchSeen = (id: FeatureLaunchId) => {
  if (isFeatureLaunchSeen(id)) return
  try {
    window.localStorage.setItem(getSeenKey(id), '1')
  } catch {
    seenThisSession.add(id)
  }
  listeners.forEach((listener) => listener())
}

export const subscribeToFeatureLaunches = (listener: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key.endsWith(SEEN_SUFFIX)) listener()
  }
  listeners.add(listener)
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}
