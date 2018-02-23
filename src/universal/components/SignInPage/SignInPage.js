/**
 * The sign-in page.  Hosts 3rd party signin, email/password signin, and also
 * functions as the callback handler for the Auth0 OIDC response.
 *
 * @flow
 */

import type {Node} from 'react';
import type {RouterHistory, Location} from 'react-router-dom';
import type {Dispatch} from 'redux';
import type {AuthResponse, AuthError, Credentials} from 'universal/types/auth';

import {WebAuth} from 'auth0-js';
import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router-dom';

import signinAndUpdateToken from 'universal/components/Auth0ShowLock/signinAndUpdateToken';
import AuthPage from 'universal/components/AuthPage/AuthPage';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import loginWithToken from 'universal/decorators/loginWithToken/loginWithToken';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {THIRD_PARTY_AUTH_PROVIDERS} from 'universal/utils/constants';

import SignIn from './SignIn';

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
  error: ?AuthError,
  submittingCredentials: boolean
};

class SignInPage extends Component<Props, State> {
  state = {
    error: null,
    loggingIn: false,
    submittingCredentials: false
  };

  componentDidMount() {
    this.maybeCaptureAuthResponse();
  }

  getHandlerForThirdPartyAuth = (auth0Connection: string) => () => {
    this.webAuth.authorize({
      connection: auth0Connection,
      responseType: 'token'
    });
  };

  maybeCaptureAuthResponse = async () => {
    // If we've received an auth response, log us in
    const {hash} = this.props.location;
    if (hash) {
      this.setState({loggingIn: true});
      try {
        const authResponse = await this.parseAuthResponse(hash);
        this.saveToken(authResponse);
      } catch (error) {
        this.setState({error});
      }
    }
  };

  parseAuthResponse = (hash: string): Promise<AuthResponse> => {
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

  saveToken = (response: AuthResponse): void => {
    signinAndUpdateToken(this.props.atmosphere, this.props.dispatch, null, response.idToken);
  };

  webAuth = new WebAuth({
    domain: __ACTION__.auth0Domain,
    clientID: __ACTION__.auth0,
    redirectUri: window.location.href,
    scope: 'openid rol tms bet'
  });

  handleSubmitCredentials = ({email, password}: Credentials) => {
    this.setState({submittingCredentials: true});
    this.webAuth.login({
      email,
      password,
      realm: 'Username-Password-Authentication',
      responseType: 'token'
    }, (error) => {
      this.setState({
        error,
        submittingCredentials: false
      });
    });
  };

  renderLoading = () => {
    return <LoadingView />;
  }

  renderLoadingError = () => {
    return (
      <Fragment>
        <h1>
          🤭 Oops!
        </h1>
        <p>
          We had some trouble signing you in!
        </p>
        <p>
          Try going back to the <Link to="/signin" onClick={this.resetState}>Sign in page</Link> in order to sign in again.
        </p>
      </Fragment>
    );
  };

  renderSignIn = () => {
    const {error, submittingCredentials} = this.state;
    return (
      <SignIn
        authProviders={THIRD_PARTY_AUTH_PROVIDERS}
        getHandlerForThirdPartyAuth={this.getHandlerForThirdPartyAuth}
        handleSubmitCredentials={this.handleSubmitCredentials}
        error={error && error.error_description}
        isSubmitting={submittingCredentials}
      />
    );
  };

  render() {
    const {loggingIn, error} = this.state;

    let pageContent: Node;
    if (loggingIn && !error) {
      pageContent = this.renderLoading();
    } else if (loggingIn && error) {
      pageContent = this.renderLoadingError();
    } else {
      pageContent = this.renderSignIn();
    }
    return (
      <AuthPage title="Sign In | Parabol">
        {pageContent}
      </AuthPage>
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
  loginWithToken(
    withRouter(
      connect(mapStateToProps, mapDispatchToProps)(SignInPage)
    )
  )
);
