import React, {Component} from 'react';
import {push} from 'react-router-redux';
import getAuthedUser from 'universal/redux/getAuthedUser';
import {cashay} from 'cashay';

// eslint-disable-next-line arrow-body-style
export default ComposedComponent => {
  return class TokenizedComp extends Component {
    render() {
      const user = getAuthedUser();
      const {dispatch} = cashay.store;
      // remove expired tokens from state
      if (user) {
        if (user.profile.isNew) {
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
