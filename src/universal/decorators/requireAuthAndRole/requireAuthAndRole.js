import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {showError} from 'universal/modules/toast/ducks/toastDuck';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {connect} from 'react-redux';

const unauthorizedDefault = {
  title: 'Unauthorized',
  message: 'Hey! You’re not supposed to be there. Bringing you someplace safe.'
};

const unauthenticatedDefault = {
  title: 'Unauthenticated',
  message: 'Hey! You haven’t signed in yet. Taking you to the sign in page.'
};

export default ({
  role,
  silent = false,
  unauthorized = unauthorizedDefault,
  unauthenticated = unauthenticatedDefault,
  unauthRoute = '/'
} = {}) => (ComposedComponent) => {
  class RequiredAuthAndRole extends Component {
    static propTypes = {
      atmosphere: PropTypes.object.isRequired,
      dispatch: PropTypes.func.isRequired,
      history: PropTypes.object.isRequired,
      location: PropTypes.object.isRequired
    };

    constructor(props) {
      super(props);
      const {atmosphere: {authObj}, dispatch, history, location: {pathname}} = props;
      if (authObj) {
        const {rol} = authObj;
        if (role && role !== rol) {
          if (!silent) {
            setTimeout(() => dispatch(showError(unauthorized)));
          }
          history.push(unauthRoute);
          this.redir = true;
        }
      } else {
        if (!silent) {
          setTimeout(() => dispatch(showError(unauthenticated)));
        }
        history.push({pathname: unauthRoute, search: `?redirectTo=${encodeURIComponent(pathname)}`});
        this.redir = true;
      }
    }

    render() {
      if (this.redir) return null;
      return <ComposedComponent {...this.props} />;
    }
  }

  return connect()(withAtmosphere(RequiredAuthAndRole));
};
