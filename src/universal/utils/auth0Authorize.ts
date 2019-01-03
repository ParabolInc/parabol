import {WebAuth} from 'auth0-js'
import promisify from 'es6-promisify'
import makeHref from 'universal/utils/makeHref'

/*
 * Requires sync webAuth to ensure it is not caught by a popup blocker.
 * Popup blockers usually ignore trusted user events (like clicks)
 * But doing asynchronous things within the click handler can cause a false positive
 */

const auth0Authorize = async (webAuth: WebAuth) => {
  const authorize = promisify(webAuth.popup.authorize, webAuth.popup)
  return authorize({
    connection: 'google-oauth2',
    redirectUri: makeHref('/oauth-redirect'),
    responseType: 'token'
  })
}

export default auth0Authorize
