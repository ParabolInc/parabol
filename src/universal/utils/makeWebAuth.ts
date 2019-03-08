import {WebAuth} from 'auth0-js'

let webAuth: WebAuth
const makeWebAuth = async () => {
  const auth0 = await import(/* webpackChunkName: 'Auth0' */ 'auth0-js/build/auth0')
  if (!webAuth) {
    webAuth = new auth0.WebAuth({
      domain: window.__ACTION__.auth0Domain,
      clientID: window.__ACTION__.auth0,
      scope: 'openid rol tms bet'
    })
  }
  return webAuth
}

export default makeWebAuth
