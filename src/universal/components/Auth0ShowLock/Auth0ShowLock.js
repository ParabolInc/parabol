import PropTypes from 'prop-types';
import React from 'react';
import signinAndUpdateToken from './signinAndUpdateToken';
import injectGlobals from 'universal/styles/hepha';
import auth0Overrides from 'universal/styles/theme/auth0Overrides';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

/*
 * NOTE: showLock is, and may only ever be called from the client:
 *
 * We require auth0-lock from within this function because it cannot be
 * rendered within the SSR.
 */
let stylesInjected;
export function showLock(atmosphere, dispatch) {
  if (!stylesInjected) {
    stylesInjected = true;
    injectGlobals(auth0Overrides);
  }
  // eslint-disable-next-line global-require
  require.ensure([], (require) => {
    const Auth0Lock = require('auth0-lock');
    const {auth0, auth0Domain} = window.__ACTION__;
    const lock = new Auth0Lock(auth0, auth0Domain);
    lock.show({
      authParams: {
        scope: 'openid rol tms bet',
        prompt: 'select_account'
      }
    }, (error, profile, authToken) => {
      if (error) throw error;
      signinAndUpdateToken(atmosphere, dispatch, profile, authToken);
    });
  });
}

const Auth0ShowLock = (props) => {
  const {atmosphere, dispatch} = props;
  return (
    <div>{
      /* auth0 lock can't SSR: */
      __CLIENT__ && showLock(atmosphere, dispatch)
    }</div>
  );
};

Auth0ShowLock.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

export default withAtmosphere(Auth0ShowLock);
