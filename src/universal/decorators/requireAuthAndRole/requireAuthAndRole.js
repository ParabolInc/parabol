import React, {Component, PropTypes} from 'react';
import {showError} from 'universal/modules/toast/ducks/toastDuck';
import {getAuthQueryString, getAuthedOptions} from 'universal/redux/getAuthedUser';
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
  const userId = state.auth.obj.sub;
  return {
    auth: state.auth.obj,
    user: cashay.query(getAuthQueryString, getAuthedOptions(userId)).data.user
  };
};

export default role => ComposedComponent => {
  @connect(mapStateToProps)
  @withRouter
  class RequiredAuthAndRole extends Component {
    static propTypes = {
      auth: PropTypes.object,
      user: PropTypes.object,
      dispatch: PropTypes.func,
      router: PropTypes.object
    };


    render() {
      const {auth, dispatch, router} = this.props;
      if (auth === undefined) {
        throw new Error('Auth token undefined. Did you put @connect on your component?');
      }
      if (role) {
        if (auth.sub && auth.rol === role) {
          // We had a role to check, and role checks out:
          return <ComposedComponent {...this.props} />;
        }
        dispatch(showError(unauthorized));
      } else if (auth.sub) {
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
