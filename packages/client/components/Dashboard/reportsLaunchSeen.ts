export const REPORTS_LAUNCH_SEEN_KEY = 'reportsLaunchSeen'
export const REPORTS_LAUNCH_SUNSET = new Date(2027, 0, 1)

export const isReportsLaunchGlowActive = (now: Date, seen: boolean) =>
  !seen && now < REPORTS_LAUNCH_SUNSET

export const readReportsLaunchSeen = () => {
  try {
    return !!window.localStorage.getItem(REPORTS_LAUNCH_SEEN_KEY)
  } catch {
    return false
  }
}

export const markReportsLaunchSeen = () => {
  try {
    window.localStorage.setItem(REPORTS_LAUNCH_SEEN_KEY, '1')
  } catch {}
}
