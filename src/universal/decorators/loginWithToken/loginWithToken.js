import React, {PropTypes, Component} from 'react';
import {push} from 'react-router-redux';
import getAuth from 'universal/redux/getAuth';
import {cashay} from 'cashay';

// eslint-disable-next-line arrow-body-style
export default ComposedComponent => {
  return class TokenizedComp extends Component {
    render() {
      const auth = getAuth(true);
      const {dispatch} = cashay.store;
      // remove expired tokens from state
      if (auth.authToken) {
        dispatch(push('/me'));
        return null;
      }
      return <ComposedComponent {...this.props} dispatch={dispatch}/>;
    }
  };
};
