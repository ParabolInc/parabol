import getOAuthPopupFeatures from './getOAuthPopupFeatures'

const getTokenFromSSO = (url: string) => {
  const popup = window.open(url, 'SSO', getOAuthPopupFeatures({width: 385, height: 550, top: 64}))

  let closeCheckerId
  return new Promise<{token: string | null; error: string | null}>((resolve) => {
    const handler = (event) => {
      // an extension posted to the opener
      if (typeof event.data !== 'object') return
      const {token, error} = event.data
      if (!token && !error) return
      if (event.origin !== window.location.origin) return

      window.clearInterval(closeCheckerId)
      popup && popup.close()
      window.removeEventListener('message', handler)
      resolve({token, error})
    }

    closeCheckerId = window.setInterval(() => {
      if (popup && popup.closed) {
        resolve({token: null, error: 'Error logging in. Did you close the popup window?'})
        window.clearInterval(closeCheckerId)
        window.removeEventListener('message', handler)
      }
    }, 100)
    window.addEventListener('message', handler)
  })
}

export default getTokenFromSSO
