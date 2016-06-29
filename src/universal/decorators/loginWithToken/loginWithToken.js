import React, {Component, PropTypes} from 'react';
import {push} from 'react-router-redux';
import getAuthedUser from 'universal/redux/getAuthedUser';

// eslint-disable-next-line arrow-body-style
export default ComposedComponent => {
  return class TokenizedComp extends Component {
    static propTypes = {
      dispatch: PropTypes.func,
      authToken: PropTypes.string
    };

    render() {
      const user = getAuthedUser();
      const {dispatch, authToken} = this.props;

      // remove expired tokens from state
      if (authToken && user) {
        if (user.profile.isNew) {
          dispatch(push('/welcome'));
        } else if (user.profile.isNew === false) {
          dispatch(push('/me'));
        }
        return null;
      }
      return <ComposedComponent {...this.props} dispatch={dispatch}/>;
    }
  };
};
