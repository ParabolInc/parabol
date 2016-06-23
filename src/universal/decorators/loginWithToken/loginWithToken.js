import React, {Component} from 'react';
import {push} from 'react-router-redux';
import getAuth from 'universal/redux/getAuth';
import {cashay} from 'cashay';

// eslint-disable-next-line arrow-body-style
export default ComposedComponent => {
  return class TokenizedComp extends Component {
    render() {
      const auth = getAuth();
      const {dispatch} = cashay.store;
      // remove expired tokens from state
      if (auth.authToken) {
        if (auth.user.profile.isNew) {
          dispatch(push('/welcome'));
        } else {
          dispatch(push('/me'));
        }
        return null;
      }
      return <ComposedComponent {...this.props} dispatch={dispatch}/>;
    }
  };
};
