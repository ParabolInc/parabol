import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {showError} from 'universal/modules/toast/ducks/toastDuck';
import {getAuthQueryString, getAuthedOptions} from 'universal/redux/getAuthedUser';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {setNextUrl} from 'universal/redux/authDuck';

const unauthorizedDefault = {
  title: 'Unauthorized',
  message: 'Hey! You\'re not supposed to be there. Bringing you someplace safe.'
};

const unauthenticatedDefault = {
  title: 'Unauthenticated',
  message: 'Hey! You haven\'t signed in yet. Taking you to the sign in page.'
};

const mapStateToProps = (state) => {
  const userId = state.auth.obj.sub;
  return {
    auth: state.auth.obj,
    user: cashay.query(getAuthQueryString, getAuthedOptions(userId)).data.user
  };
};

export default (role, {
  /* optional named options: */
  silent = false,
  unauthorized = unauthorizedDefault,
  unauthenticated = unauthenticatedDefault
} = {}) => (ComposedComponent) => {
  @connect(mapStateToProps)
  @withRouter
  class RequiredAuthAndRole extends Component {
    static propTypes = {
      auth: PropTypes.object,
      user: PropTypes.object,
      dispatch: PropTypes.func,
      history: PropTypes.object,
      location: PropTypes.object
    };

    componentWillMount() {
      this.handleAuthChange(this.props);
    }

    componentWillReceiveProps(nextProps) {
      const {auth: {sub: prevSub}} = this.props;
      const {auth: {sub: nextSub}} = nextProps;
      if (prevSub !== nextSub) {
        this.handleAuthChange(nextProps);
      }
    }

    handleAuthChange(props) { // eslint-disable-line
      const {auth, dispatch, location: {pathname}} = props;

      if (auth.sub) {
        if (role && auth.rol !== role && !silent) {
          dispatch(showError(unauthenticated));
        }
      } else {
        // no legit authToken
        if (!silent) {
         // squak about it:
          dispatch(showError(unauthorized));
        }
        dispatch(setNextUrl(pathname));
      }
    }

    render() {
      const {auth, history} = this.props;
      if (auth === undefined) {
        throw new Error('Auth token undefined. Did you put @connect on your component?');
      }
      if (role) {
        if (auth.sub && auth.rol === role) {
          // We had a role to check, and role checks out:
          return <ComposedComponent {...this.props} />;
        }
      } else if (auth.sub) {
        // We were looking for any authenticated user only:
        return <ComposedComponent {...this.props} />;
      }
      history.push('/');
      return null;
    }
  }
  return RequiredAuthAndRole;
};
