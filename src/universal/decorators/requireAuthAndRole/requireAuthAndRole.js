import React, {Component, PropTypes} from 'react';
import jwtDecode from 'jwt-decode';
import {showError} from 'universal/modules/notifications/ducks/notifications';
import {getAuthQueryString, authedOptions} from 'universal/redux/getAuthedUser';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

const unauthorized = {
  title: 'Unauthorized',
  message: 'Hey! You\'re not supposed to be there. Bringing you someplace safe.'
};

const unauthenticated = {
  title: 'Unauthenticated',
  message: 'Hey! You haven\'t signed in yet. Taking you to the sign in page.'
};

const mapStateToProps = state => {
  const user = cashay.query(getAuthQueryString, authedOptions).data.user;
  return {
    authToken: state.authToken,
    user
  };
};

export default role => ComposedComponent => {
  @connect(mapStateToProps)
  @withRouter
  class RequiredAuthAndRole extends Component {
    static propTypes = {
      authToken: PropTypes.string,
      user: PropTypes.object,
      dispatch: PropTypes.func,
      router: PropTypes.object
    };

    render() {
      const {authToken, dispatch, router} = this.props;
      if (authToken === undefined) {
        throw new Error('Auth token undefined. Did you put @connect on your component?');
      }
      const authObj = authToken && jwtDecode(authToken);
      if (role) {
        if (authObj && authObj.rol === role) {
          // We had a role to check, and role checks out:
          return <ComposedComponent {...this.props} />;
        }
        dispatch(showError(unauthorized));
      } else if (authObj) {
        // We were looking for any authenticated user only:
        return <ComposedComponent {...this.props} />;
      } else {
        // no legit authToken to be had
        dispatch(showError(unauthenticated));
      }
      router.push('/');
      return null;
    }
  }
  return RequiredAuthAndRole;
};
