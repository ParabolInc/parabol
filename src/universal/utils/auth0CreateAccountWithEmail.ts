import promisify from 'es6-promisify'
import makeWebAuth from './makeWebAuth'
import {AUTH0_DB_CONNECTION} from 'universal/utils/constants'
import makeHref from 'universal/utils/makeHref'

const auth0CreateAccountWithEmail = async (email, password) => {
  const webAuth = await makeWebAuth()
  const signin = promisify(webAuth.signin, webAuth)
  return signin({
    email,
    password,
    realm: AUTH0_DB_CONNECTION,
    redirectUri: makeHref(`/oauth-redirect${window.location.search}`),
    responseType: 'token'
  })
}

export default auth0CreateAccountWithEmail
