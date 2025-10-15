// Firefox < 140 (released 2025-06-24) does not support cookieStore API
import Cookies from 'js-cookie'

const cookieName = 'authToken'

export const getAuthCookie = async (global: Window) => {
  if (!global) return null
  const cookieStore = global.cookieStore
  if (!cookieStore) {
    return Cookies.get(cookieName) ?? null;
  }
  const authCookie = await cookieStore.get(cookieName)
  const authToken = authCookie?.value ?? null
  return authToken
}

export const onAuthCookieChange = (global: Window, callback: (token: string | null) => void) => {
  if (!global) return null
  const cookieStore = global.cookieStore
  if (!cookieStore) {
    return
  }
  return cookieStore.addEventListener('change', (event) => {
    const authCookieChange = event.changed.find(change => change.name === cookieName)
    if (authCookieChange) {
      const newValue = authCookieChange.value ?? null
      callback(newValue)
    }
  })
}
