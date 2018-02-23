/**
 * The sign-up page.  Can sign up via email/password or 3rd party auth.
 *
 * @flow
 */

import type {AuthError, Credentials} from 'universal/types/auth';
import type {RouterHistory, Location} from 'react-router-dom';
import type {Dispatch} from 'redux';

import {WebAuth} from 'auth0-js';
import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';

import AuthPage from 'universal/components/AuthPage/AuthPage';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {THIRD_PARTY_AUTH_PROVIDERS} from 'universal/utils/constants';
import SignUp from './SignUp';

type Props = {
  atmosphere: Object,
  dispatch: Dispatch<*>,
  hasSession: boolean,
  history: RouterHistory,
  location: Location
};

type State = {
  error: ?AuthError,
  submittingCredentials: boolean
};

class SignUpPage extends Component<Props, State> {
  state = {
    error: null,
    submittingCredentials: false
  };

  getHandlerForThirdPartyAuth = (auth0Connection: string) => () => {
    this.webAuth.authorize({
      connection: auth0Connection,
      responseType: 'token'
    });
  };

  auth0SignUp = ({email, password}: Credentials): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.setState({submittingCredentials: true});
      this.webAuth.signup({
        email,
        password,
        connection: 'Username-Password-Authentication',
        responseType: 'token'
      }, (error) => {
        this.setState({
          error,
          submittingCredentials: false
        });
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

  handleSubmitCredentials = async (credentials: Credentials): Promise<void> => {
    await this.auth0SignUp(credentials);
    this.webAuth.login({
      ...credentials,
      realm: 'Username-Password-Authentication',
      responseType: 'token'
    }, (error) => {
      this.setState({error});
    });
  };

  render() {
    const {error} = this.state;
    return (
      <AuthPage title="Sign Up | Parabol">
        <SignUp
          authProviders={THIRD_PARTY_AUTH_PROVIDERS}
          error={error && error.error_description}
          getHandlerForThirdPartyAuth={this.getHandlerForThirdPartyAuth}
          handleValidSignUpCredentials={this.handleSubmitCredentials}
          isSubmitting={this.state.submittingCredentials}
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
