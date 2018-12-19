import {WebAuth} from 'auth0-js/build/auth0'
import {SIGNIN_SLUG} from 'universal/utils/constants'

const getWebAuth = () => {
  return new WebAuth({
    domain: window.__ACTION__.auth0Domain,
    clientID: window.__ACTION__.auth0,
    redirectUri: `${window.location.origin}/${SIGNIN_SLUG}${window.location.search}`,
    scope: 'openid rol tms bet'
  })
}

export default getWebAuth
