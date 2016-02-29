import config from '../../config/config';

let lock = null;
if (__CLIENT__) {
  const { auth0 } = config.app;
  const Auth0Lock = require('auth0-lock');
  lock = new Auth0Lock(auth0.clientId, auth0.account);
}

export default lock;
