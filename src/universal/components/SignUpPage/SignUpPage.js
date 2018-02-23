/**
 * The sign-up page.  Can sign up via email/password or 3rd party auth.
 *
 * @flow
 */

// FIXME - fix page title
// FIXME - show when email is taken
// TODO - third party signup
// TODO - dedup logic shared with signin page
// TODO - prevent double submit

import type {RouterHistory, Location} from 'react-router-dom';
import type {Dispatch} from 'redux';
import type {AuthResponse} from 'universal/types/auth';

import {WebAuth} from 'auth0-js';
import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';

import signinAndUpdateToken from 'universal/components/Auth0ShowLock/signinAndUpdateToken';
import AuthPage from 'universal/components/AuthPage/AuthPage';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {THIRD_PARTY_AUTH_PROVIDERS} from 'universal/utils/constants';
import SignUp from './SignUp';

type SignUpCredentials = {
  email: string,
  password: string,
  confirmedPassword: string
}

type Props = {
  atmosphere: Object,
  dispatch: Dispatch<*>,
  hasSession: boolean,
  history: RouterHistory,
  location: Location
};

type State = {
  error: ?Error
};

class SignUpPage extends Component<Props, State> {
  state = {
    error: null
  };

  componentDidMount() {
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

  auth0SignUp = ({email, password}: SignUpCredentials): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.webAuth.signup({
        email,
        password,
        connection: 'Username-Password-Authentication',
        responseType: 'token'
      }, (error) => {
        this.setState({error});
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };

  webAuth = new WebAuth({
    domain: __ACTION__.auth0Domain,
    clientID: __ACTION__.auth0,
    redirectUri: `${window.location.origin}/signin${window.location.search}`,
    scope: 'openid rol tms bet'
  });

  handleSubmitCredentials = async (credentials: SignUpCredentials): Promise<void> => {
    await this.auth0SignUp(credentials);
    this.webAuth.login({
      ...credentials,
      realm: 'Username-Password-Authentication',
      responseType: 'token'
    }, (error) => {
      this.setState({error});
    });
  };

  saveToken = (response: AuthResponse): void => {
    signinAndUpdateToken(this.props.atmosphere, this.props.dispatch, null, response.idToken);
  };

  render() {
    return (
      <AuthPage>
        <SignUp
          authProviders={THIRD_PARTY_AUTH_PROVIDERS}
          getHandlerForThirdPartyAuth={this.getHandlerForThirdPartyAuth}
          handleValidSignUpCredentials={this.handleSubmitCredentials}
        />
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

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(withAtmosphere(SignUpPage))
);
