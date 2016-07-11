import React, {Component, PropTypes} from 'react';
import {push} from 'react-router-redux';
import jwtDecode from 'jwt-decode';
import {error as showError} from 'universal/modules/notifications/ducks/notifications';
import {getAuthQueryString, authedOptions} from 'universal/redux/getAuthedUser';
import {cashay} from 'cashay';
import {connect} from 'react-redux';

const unauthorized = {
  title: 'Unauthorized',
  message: 'Hey! You\'re not supposed to be there. Bringing you someplace safe.'
};

const unauthenticated = {
  title: 'Unauthenticated',
  message: 'Hey! You haven\'t signed in yet. Taking you to the sign in page.'
};

const mapStateToProps = state => {
  return {
    authToken: state.authToken,
    user: cashay.query(getAuthQueryString, authedOptions).data.user
  };
};

export default role => ComposedComponent => {
  @connect(mapStateToProps)
  class RequiredAuthAndRole extends Component {
    static propTypes = {
      authToken: PropTypes.string,
      user: PropTypes.object,
      dispatch: PropTypes.func
    };
    render() {
      const {authToken, dispatch, user} = this.props;
      if (authToken === undefined) {
        throw new Error('Auth token undefined. Did you put @connect on your component?');
      }
      const authObj = authToken && jwtDecode(authToken);
      if (role) {
        if (authObj && authObj.rol === role) {
          // We had a role to check, and role checks out:
          return <ComposedComponent {...this.props} user={user}/>;
        }
        dispatch(showError(unauthorized));
      } else if (authObj) {
        // We were looking for any authenticated user only:
        return <ComposedComponent {...this.props} user={user}/>;
      } else {
        // no legit authToken to be had
        dispatch(showError(unauthenticated));
      }
      dispatch(push('/'));
      return null;
    }
  }
  return RequiredAuthAndRole;
};
