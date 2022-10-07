import getOAuthPopupFeatures from './getOAuthPopupFeatures'

const getTokenFromSSO = (url: string) => {
  // It's possible we prematurely opened a popup named SSO at the URL about:blank to avoid popup blockers
  // Calling window.open again will get a reference to that popup
  // Then, we can update the href to the valid URL
  const popup = window.open(url, 'SSO', getOAuthPopupFeatures({width: 385, height: 550, top: 64}))
  if (!popup) return {token: null, error: 'Failed to open login popup'}
  popup.location.href = url
  let closeCheckerId: undefined | number
  return new Promise<{token: string | null; error: string | null}>((resolve) => {
    const handler = (event: MessageEvent) => {
      // an extension posted to the opener
      if (typeof event.data !== 'object') return
      const {token, error} = event.data
      if (!token && !error) return
      if (event.origin !== window.location.origin) return

      window.clearInterval(closeCheckerId)
      popup?.close()
      window.removeEventListener('message', handler)
      resolve({token, error})
    }

    closeCheckerId = window.setInterval(() => {
      if (popup?.closed) {
        resolve({token: null, error: 'Error logging in. Did you close the popup window?'})
        window.clearInterval(closeCheckerId)
        window.removeEventListener('message', handler)
      }
    }, 100)
    window.addEventListener('message', handler)
  })
}

export default getTokenFromSSO
