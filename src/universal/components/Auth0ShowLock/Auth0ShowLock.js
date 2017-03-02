import React, {PropTypes} from 'react';
import {auth0 as defaultClientOptions} from 'universal/utils/clientOptions';
import signinAndUpdateToken from './signinAndUpdateToken';

/*
 * NOTE: showLock is, and may only ever be called from the client:
 *
 * We require auth0-lock from within this function because it cannot be
 * rendered within the SSR.
 */
export function showLock(dispatch) {
  // eslint-disable-next-line global-require
  const Auth0Lock = require('auth0-lock');
  let clientOptions = defaultClientOptions;
  if (__PRODUCTION__) {
  // See server/Html.js for how this is initialized:
    clientOptions = window.__ACTION__.auth0;
  }
  const {clientId, domain} = clientOptions;
  const lock = new Auth0Lock(clientId, domain);
  lock.show({
    authParams: {
      scope: 'openid rol tms'
    }
  }, (error, profile, authToken) => {
    if (error) throw error;
    signinAndUpdateToken(dispatch, profile, authToken);
  });
}

const Auth0ShowLock = (props) => {
  const {dispatch} = props;
  return (
    <div>{
      /* auth0 lock can't SSR: */
      __CLIENT__ && showLock(dispatch)
    }</div>
  );
};

Auth0ShowLock.propTypes = {
  dispatch: PropTypes.func.isRequired
};

export default Auth0ShowLock;
