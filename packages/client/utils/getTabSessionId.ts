const TAB_SESSION_STORAGE_KEY = 'parabol:tabSessionId'

let tabSessionId: string | undefined

const readStoredTabSessionId = () => {
  try {
    return window.sessionStorage.getItem(TAB_SESSION_STORAGE_KEY)
  } catch {
    return null
  }
}

const storeTabSessionId = (sessionId: string) => {
  try {
    window.sessionStorage.setItem(TAB_SESSION_STORAGE_KEY, sessionId)
  } catch {
    return
  }
}

const getTabSessionId = () => {
  if (!tabSessionId) {
    tabSessionId = readStoredTabSessionId() || crypto.randomUUID()
    storeTabSessionId(tabSessionId)
  }
  return tabSessionId
}

export default getTabSessionId
