import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {auth0} from 'universal/utils/clientOptions';
import {setAuthToken} from 'universal/redux/authDuck';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
import {segmentEvent} from 'universal/redux/segmentActions';

export function showLock(dispatch) {
  // eslint-disable-next-line global-require
  const Auth0Lock = require('auth0-lock');
  const {clientId, account} = auth0;
  const lock = new Auth0Lock(clientId, account);
  lock.show({
    authParams: {
      scope: 'openid rol tms'
    }
  }, async(error, profile, authToken) => {
    if (error) throw error;
    // TODO: stuff this in a utility function
    cashay.create({httpTransport: new ActionHTTPTransport(authToken)});
    const options = {variables: {authToken}};
    await cashay.mutate('updateUserWithAuthToken', options);
    // the Invitation script starts processing the token when auth.sub is truthy
    // That doesn't necessarily mean that the DB has created the new user's account though. Auth0 could take awhile.
    // So, to avoid the race condition, wait for the account be get created, then set the token to accept the token
    dispatch(setAuthToken(authToken, profile));
    dispatch(segmentEvent('User Login'));
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
