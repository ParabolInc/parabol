import promisify from 'es6-promisify'
import makeWebAuth from './makeWebAuth'
import makeHref from 'universal/utils/makeHref'

const auth0Authorize = async () => {
  const webAuth = await makeWebAuth()
  const authorize = promisify(webAuth.popup.authorize, webAuth.popup)
  return authorize({
    connection: 'google-oauth2',
    redirectUri: makeHref('/oauth-redirect'),
    responseType: 'token'
  })
}

export default auth0Authorize
