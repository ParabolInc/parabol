import makeHref from 'universal/utils/makeHref'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'

/*
 * Requires sync webAuth to ensure it is not caught by a popup blocker.
 * Popup blockers usually ignore trusted user events (like clicks)
 * But doing asynchronous things within the click handler can cause a false positive
 */

const auth0Authorize = async (loginHint?: string) => {
  return new Promise<{idToken: string} | null>((resolve, reject) => {
    let closeCheckerId
    const upState = Math.random()
      .toString(36)
      .substring(5)
    // Auth0 has a super nasty bug where it doesn't play well
    const hint = loginHint ? `&login_hint=${loginHint}` : ''
    const authUrl = `https://${window.__ACTION__.auth0Domain}/authorize?client_id=${
      window.__ACTION__.auth0
    }&scope=openid rol tms bet&connection=google-oauth2&redirect_uri=${makeHref(
      '/oauth-redirect'
    )}&response_type=token&state=${upState}&prompt=select_account${hint}`
    const popup = window.open(
      authUrl,
      'OAuth',
      getOAuthPopupFeatures({width: 385, height: 550, top: 64})
    )

    const handler = (event) => {
      // an extension posted to the opener
      if (typeof event.data !== 'object' || event.data.state !== upState) return
      const {code} = event.data
      window.clearInterval(closeCheckerId)
      if (event.origin !== window.location.origin || typeof code !== 'string') {
        reject(`Bad response: ${event.data}, ${event.origin}`)
        return
      }

      popup && popup.close()
      window.removeEventListener('message', handler)
      resolve({idToken: code})
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

export default auth0Authorize
