import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import {showError} from 'universal/modules/toast/ducks/toastDuck';
import {QueryRenderer} from 'react-relay';
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

const query = graphql`
  query requireAuthAndRoleQuery {
    viewer {
      viewerId: id
      authToken {
        tokenRole: rol
      }
    }
  }
`;

export default (role, {
  /* optional named options: */
  silent = false,
  unauthorized = unauthorizedDefault,
  unauthenticated = unauthenticatedDefault
} = {}) => (ComposedComponent) => {
  class RequiredAuthAndRole extends Component {
    static propTypes = {
      dispatch: PropTypes.func.isRequired,
      history: PropTypes.object.isRequired,
      location: PropTypes.object.isRequired,
    };

    render() {
      const {atmosphere, dispatch} = this.props;
      atmosphere.setNet('local');
      return (
        <QueryRenderer
          environment={atmosphere}
          query={query}
          variables={{}}
          render={({props}) => {
            const {location: {pathname}} = this.props;
            const {viewer} = props;
            if (viewer) {
              const {authToken: {tokenRole}} = viewer;
              if (role && role !== tokenRole) {
                if (!silent) {
                  setTimeout(() => dispatch(showError(unauthorized)));
                }
                return <Redirect to="/" />
              }
            } else {
              if (!silent) {
                setTimeout(() => dispatch(showError(unauthenticated)));
              }
              return <Redirect to={{pathname: '/', search: `?redirectTo=${encodeURIComponent(pathname)}`}} />;
            }
            return <ComposedComponent {...this.props} />;
          }}
        />
      )
    }
  }

  return connect()(withAtmosphere(RequiredAuthAndRole));
};
