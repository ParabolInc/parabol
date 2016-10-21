import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {setAuthToken} from 'universal/redux/authDuck';
import {setProfile} from 'universal/redux/profileDuck';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
import {segmentEvent} from 'universal/redux/segmentActions';
import {auth0 as defaultClientOptions} from 'universal/utils/clientOptions';


async function updateToken(dispatch, profile, authToken) {
  cashay.create({httpTransport: new ActionHTTPTransport(authToken)});
  const options = {variables: {authToken}};
  await cashay.mutate('updateUserWithAuthToken', options);
  /*
   * The Invitation script starts processing the token when auth.sub is truthy
   * That doesn't necessarily mean that the DB has created the new user's
   * account though. Auth0 could take awhile. So, to avoid the race condition,
   * wait for the account be get created, then set the token to accept the
   * token.
   */
  dispatch(setProfile(profile));
  dispatch(setAuthToken(authToken, profile));
  dispatch(segmentEvent('User Login'));
}

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
    clientOptions = window.__ACTION__.auth0; // eslint-disable-line no-underscore-dangle
  }
  const {clientId, domain} = clientOptions;
  const lock = new Auth0Lock(clientId, domain);
  lock.show({
    authParams: {
      scope: 'openid rol tms'
    }
  }, (error, profile, authToken) => {
    if (error) throw error;
    updateToken(dispatch, profile, authToken);
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
