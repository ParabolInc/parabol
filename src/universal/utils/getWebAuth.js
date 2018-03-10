import {WebAuth} from 'auth0-js';

export default function getWebAuth() {
  return new WebAuth({
    domain: __ACTION__.auth0Domain,
    clientID: __ACTION__.auth0,
    redirectUri: `${window.location.origin}/signin${window.location.search}`,
    scope: 'openid rol tms bet'
  });
}
