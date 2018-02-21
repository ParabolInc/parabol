/**
 * The sign-in page.  Hosts 3rd part signin, email/password signin, and
 * also functions as the callback handler for the Auth0 OIDC response.
 *
 * @flow
 */
import type {Dispatch} from 'redux';
import type {RouterHistory, Location} from 'react-router-dom';

import {WebAuth} from 'auth0-js';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router-dom';

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
  location: Location,
  webAuth: Object
};

type State = {
  loggingIn: boolean,
  error: ?Error
};

const containerStyles = {
  display: 'flex',
  flexDirection: 'column'
};

const loadingErrorStyles = ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%'
});

class SignInPage extends Component<Props, State> {
  state = {
    error: null,
    loggingIn: false
  };

  componentWillMount() {
    this.maybeRedirectToApp();
    this.maybeCaptureAuthResponse();
  }

  componentDidUpdate() {
    this.maybeRedirectToApp();
  }

  getHandlerForThirdPartyAuth = (auth0Connection: string) => () => {
    this.webAuth.authorize({
      connection: auth0Connection,
      responseType: 'token'
    });
  };

  maybeRedirectToApp = () => {
    const {hasSession, history, location} = this.props;
    if (hasSession) {
      const parsedSearch = new URLSearchParams(location.search);
      const pathToVisit = parsedSearch.get('redirectTo') || '/me';
      history.replace(pathToVisit);
    }
  };

  maybeCaptureAuthResponse = async () => {
    // If we've received an auth response, log us in
    const {hash} = this.props.location;
    if (hash) {
      this.setState({loggingIn: true});
      const authResponse = await this.parseAuthResponse(hash);
      try {
        this.saveToken(authResponse);
      } catch (error) {
        this.setState({error});
      }
    }
  };

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

  resetState = () => {
    this.setState({loggingIn: false, error: null});
  };

  saveToken = (response: ParsedAuthResponse): void => {
    signinAndUpdateToken(this.props.atmosphere, this.props.dispatch, null, response.idToken);
  };

  webAuth = new WebAuth({
    domain: __ACTION__.auth0Domain,
    clientID: __ACTION__.auth0,
    redirectUri: window.location.href,
    scope: 'openid rol tms bet'
  });

  authProviders = [
    {displayName: 'Google', auth0Connection: 'google-oauth2', iconName: 'google'}
  ];

  handleSubmitCredentials = ({email, password}: Credentials) => {
    this.webAuth.login({
      email,
      password,
      realm: 'Username-Password-Authentication',
      responseType: 'token'
    }, (error) => {
      this.setState({error});
    });
  };

  renderLoading = () => {
    return <LoadingView />;
  }

  renderLoadingError = () => {
    return (
      <div style={containerStyles}>
        <Header />
        <div style={loadingErrorStyles}>
          <h1>
            🤭 Oops!
          </h1>
          <p>
            We had some trouble signing you in!
          </p>
          <p>
            Try going back to the <Link to="/signin" onClick={this.resetState}>Sign in page</Link> in order to sign in again.
          </p>
        </div>
      </div>
    );
  };

  render() {
    const {loggingIn, error} = this.state;

    if (loggingIn && !error) {
      return this.renderLoading();
    }
    if (loggingIn && error) {
      return this.renderLoadingError();
    }
    return (
      <div style={containerStyles}>
        <Header />
        <SignIn
          hasError={Boolean(error)}
          authProviders={this.authProviders}
          getHandlerForThirdPartyAuth={this.getHandlerForThirdPartyAuth}
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
