// Firefox < 140 (released 2025-06-24) does not support cookieStore API
import Cookies from 'js-cookie'

const cookieName = 'authToken'

export const getAuthCookie = (global: Window) => {
  if (!global) return null
  return Cookies.get(cookieName) ?? null
}

export const onAuthCookieChange = (global: Window, callback: (token: string | null) => void) => {
  if (!global) return undefined
  const cookieStore = global.cookieStore
  if (!cookieStore) {
    return undefined
  }

  const listener = (event: CookieChangeEvent) => {
    const authCookieChange = event.changed.find((change) => change.name === cookieName)
    if (authCookieChange) {
      const newValue = authCookieChange.value ?? null
      callback(newValue)
    }
  }
  cookieStore.addEventListener('change', listener)
  return () => {
    cookieStore.removeEventListener('change', listener)
  }
}
