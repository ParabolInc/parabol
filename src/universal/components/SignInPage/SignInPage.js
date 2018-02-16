/**
 * The sign-in page.
 *
 * @flow
 */
import type {Dispatch} from 'redux';
import type {RouterHistory, Location} from 'react-router-dom';

import auth0 from 'auth0-js';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import signinAndUpdateToken from 'universal/components/Auth0ShowLock/signinAndUpdateToken';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

import Header from './Header';
import SignIn from './SignIn';

type Credentials = {
  email: string,
  password: string
};

type ParsedAuthResponse = {
  idToken: string,
  idTokenPayload: Object
};

type Props = {
  atmosphere: Object,
  dispatch: Dispatch<*>,
  hasSession: boolean,
  history: RouterHistory,
  location: Location
};

type State = {
  loggingIn: boolean,
  error: ?Error
};

const containerStyles = {
  display: 'flex',
  flexDirection: 'column'
};

class SignInPage extends Component<Props, State> {
  state = {
    error: null,
    loggingIn: false
  };

  componentWillMount() {
    // 1) If we've already got a session, send us to `/me`
    if (this.props.hasSession) {
      this.props.history.replace('/me');
    }
    // 2) If we've received an auth response, validate it and log us in
    const {hash} = this.props.location;
    if (hash) {
      this.setState({loggingIn: true});
      this.parseAuthResponse(hash)
        .then(this.saveTokens);
    }
  }

  componentDidUpdate() {
    if (this.props.hasSession) {
      this.props.history.push('/me');
    }
  }

  parseAuthResponse = (hash: string): Promise<ParsedAuthResponse> => {
    return new Promise((resolve, reject) => {
      this.webAuth.parseHash({hash}, (err, authResult) => {
        if (err) {
          return reject(err);
        }
        return resolve(authResult);
      });
    });
  };

  saveTokens = (response: ParsedAuthResponse): void => {
    signinAndUpdateToken(this.props.atmosphere, this.props.dispatch, null, response.idToken);
  };

  webAuth = new auth0.WebAuth({
    domain: __AUTH0_DOMAIN__,
    clientID: __AUTH0_CLIENT_ID__,
    redirectUri: window.location.href,
    scope: 'openid rol tms bet'
  });

  handleSubmitCredentials = ({email, password}: Credentials) => {
    this.webAuth.login({
      email,
      password,
      realm: 'Username-Password-Authentication', // FIXME: extract this as AUTH0_REALM to .env
      responseType: 'token'
    }, (error) => {
      this.setState({error});
    });
  };

  render() {
    const {loggingIn, error} = this.state;
    return loggingIn ? (
      <LoadingView />
    ) : (
      <div style={containerStyles}>
        <Header />
        {error &&
          <div>An error!</div>
        }
        <SignIn
          authProviders={[{displayName: 'Google'}, {displayName: 'Hooli'}]}
          handleSubmitCredentials={this.handleSubmitCredentials}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  hasSession: Boolean(state.auth.obj.sub)
});

const mapDispatchToProps = (dispatch) => ({
  dispatch
});

export default withAtmosphere(
  withRouter(
    connect(mapStateToProps, mapDispatchToProps)(SignInPage)
  )
);
