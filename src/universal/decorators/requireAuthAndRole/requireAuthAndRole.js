import React, {Component, PropTypes} from 'react';
import {push} from 'react-router-redux';
import getAuth from 'universal/redux/getAuth';
import {cashay} from 'cashay';
import jwtDecode from 'jwt-decode';
import {error as showError} from 'universal/modules/notifications/ducks/notifications';

const unauthorized = {
  title: 'Unauthorized',
  message: 'Hey! You\'re not supposed to be there. Bringing you someplace safe.',
};

export default (role) => {
  return (ComposedComponent) => {
    return class RequireAuthAndRole extends Component {
      static propTypes = {
        lastPathName: PropTypes.string,
      }

      render() {
        // no need to check for expired tokens here, right?
        // We check initial validation in the client.js. Our job should be to keep them logged in.
        const auth = getAuth();
        const authObj = auth.authToken && jwtDecode(auth.authToken);
        if (authObj) {
          if (role && authObj.rol === role) {
            // We had a role to check, and role checks out:
            return <ComposedComponent {...this.props} auth={auth} />;
          } else if (role === undefined) {
            // We were looking for any authenticated user only:
            return <ComposedComponent {...this.props} auth={auth} />;
          }
        }
        // TODO: redirect back from whence they came
        cashay.store.dispatch(showError(unauthorized));
        cashay.store.dispatch(push('/'));

        // react is a stickler for returning an element or null
        return null;
      }
    };
  };
};
