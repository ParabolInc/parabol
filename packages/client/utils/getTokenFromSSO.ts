import getOAuthPopupFeatures from './getOAuthPopupFeatures'

const getTokenFromSSO = (url: string) => {
  const popup = window.open(
    url,
    'SSO',
    getOAuthPopupFeatures({width: 385, height: 550, top: 64})
  )

  let closeCheckerId
  return new Promise<string | null>((resolve, reject) => {
    const handler = (event) => {
      // an extension posted to the opener
      if (typeof event.data !== 'object') return
      const {code} = event.data
      window.clearInterval(closeCheckerId)
      if (event.origin !== window.location.origin || typeof code !== 'string') {
        reject(`Bad response: ${event.data}, ${event.origin}`)
        return
      }

      popup && popup.close()
      window.removeEventListener('message', handler)
      resolve(code)
    }

    closeCheckerId = window.setInterval(() => {
      if (popup && popup.closed) {
        resolve(null)
        window.clearInterval(closeCheckerId)
        window.removeEventListener('message', handler)
      }
    }, 100)
    window.addEventListener('message', handler)
  })
}

export default getTokenFromSSO
