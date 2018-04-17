// @flow
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import type {Location} from 'react-router-dom';
import {Redirect, withRouter} from 'react-router-dom';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {QueryRenderer} from 'react-relay';

type Props = {
  atmosphere: Object,
  location: Location,
  viewer: Viewer
}

const query = graphql`
  query autoLoginQuery {
    viewer {
      id
      authToken {
        tms
      }
    }
  }
`;

const autoLogin = (ComposedComponent) => {
  class AutoLogin extends Component<Props> {
    static propTypes = {
      history: PropTypes.object.isRequired,
      location: PropTypes.object.isRequired
    };

    render() {
      const {atmosphere} = this.props;
      atmosphere.setNet('local');
      return (
        <QueryRenderer
          environment={atmosphere}
          query={query}
          variables={{}}
          render={({props}) => {
            const {location: {search}} = this.props;
            const {viewer} = props;
            if (viewer) {
              const {authToken: {tms}} = viewer;
              const isNew = !tms;
              if (isNew) return <Redirect to="/welcome" />;
              const nextUrl = new URLSearchParams(search).get('redirectTo') || '/me';
              return <Redirect to={nextUrl} />;
            }
            return <ComposedComponent {...this.props} />
          }}
        />
      )
    }
  }

  return withAtmosphere(withRouter(AutoLogin));
};

export default autoLogin;

