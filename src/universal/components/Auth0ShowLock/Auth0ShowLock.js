import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
import {auth0} from 'universal/utils/clientOptions';
import {setAuthToken} from 'universal/redux/authDuck';

export function showLock(dispatch) {
  // eslint-disable-next-line global-require
  const Auth0Lock = require('auth0-lock');
  const {clientId, account} = auth0;
  const lock = new Auth0Lock(clientId, account);
  lock.show({
    authParams: {
      scope: 'openid rol'
    }
  }, async(error, profile, authToken) => {
    if (error) throw error;
    // TODO: stuff this in a utility function:
    dispatch(setAuthToken(authToken));
    cashay.create({httpTransport: new ActionHTTPTransport(authToken)});
    const options = {variables: {authToken}};
    cashay.mutate('updateUserWithAuthToken', options);
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
