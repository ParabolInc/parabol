import {WebAuth} from 'auth0-js/build/auth0';

export default function getWebAuth() {
  if (typeof __CLIENT__ !== 'undefined' && __CLIENT__) {
    return new WebAuth({
      domain: __ACTION__.auth0Domain,
      clientID: __ACTION__.auth0,
      redirectUri: `${window.location.origin}/signin${window.location.search}`,
      scope: 'openid rol tms bet'
    });
  }
  return {};
}
