import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import {GA4SignUpEventEmissionRequiredArgs} from './handleSuccessfulLogin'

type ReturnType = {
  token?: string
  error?: string
  ga4Args?: GA4SignUpEventEmissionRequiredArgs
}

const getTokenFromSSO = (url: string): ReturnType | Promise<ReturnType> => {
  // It's possible we prematurely opened a popup named SSO at the URL about:blank to avoid popup blockers
  // Calling window.open again will get a reference to that popup
  // Then, we can update the href to the valid URL
  const popup = window.open(url, 'SSO', getOAuthPopupFeatures({width: 385, height: 550, top: 64}))
  if (!popup) return {error: 'Failed to open login popup'}
  popup.location.href = url
  let closeCheckerId: undefined | number
  return new Promise<ReturnType>((resolve) => {
    const handler = (event: MessageEvent) => {
      // an extension posted to the opener
      if (typeof event.data !== 'object') return
      const {token, error} = event.data
      if (!token && !error) return
      if (event.origin !== window.location.origin) return

      const params = new URLSearchParams(popup.location.search)
      const userId = params.get('userId')!
      const isNewUser = params.get('isNewUser') === 'true'
      const isPatient0 = params.get('isPatient0') === 'true'

      window.clearInterval(closeCheckerId)
      popup?.close()
      window.removeEventListener('message', handler)
      resolve({token, error, ga4Args: {userId, isNewUser, isPatient0}})
    }

    closeCheckerId = window.setInterval(() => {
      if (popup?.closed) {
        resolve({error: 'Error logging in. Did you close the popup window?'})
        window.clearInterval(closeCheckerId)
        window.removeEventListener('message', handler)
      }
    }, 100)
    window.addEventListener('message', handler)
  })
}

export default getTokenFromSSO
