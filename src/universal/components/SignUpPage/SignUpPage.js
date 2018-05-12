/**
 * The sign-up page.  Can sign up via email/password or 3rd party auth.
 *
 * @flow
 */
import type {Credentials} from 'universal/types/auth';
import type {Dispatch} from 'redux';
import promisify from 'es6-promisify';
import React, {Component} from 'react';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import auth0Login from 'universal/utils/auth0Login';
import {AUTH0_DB_CONNECTION, THIRD_PARTY_AUTH_PROVIDERS} from 'universal/utils/constants';
import getWebAuth from 'universal/utils/getWebAuth';
import SignUp from './SignUp';
import autoLogin from 'universal/decorators/autoLogin';
import AuthPage from 'universal/components/AuthPage/AuthPage';

type Props = {
  atmosphere: Object,
  dispatch: Dispatch<*>
};

type State = {
  error: ?string,
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
    const signup = promisify(this.webAuth.signup, this.webAuth);
    return signup({
      email,
      password,
      connection: AUTH0_DB_CONNECTION,
      responseType: 'token'
    });
  };

  webAuth = getWebAuth();

  handleSubmitCredentials = async (credentials: Credentials): Promise<void> => {
    this.setState({submittingCredentials: true, error: null});
    try {
      await this.auth0SignUp(credentials);
      await auth0Login(this.webAuth, credentials);
    } catch (error) {
      this.setState({error: error.description});
    }
    this.setState({submittingCredentials: false});
  };

  render () {
    const {error} = this.state;
    return (
      <AuthPage title="Sign Up | Parabol">
        <SignUp
          authProviders={THIRD_PARTY_AUTH_PROVIDERS}
          error={error}
          getHandlerForThirdPartyAuth={this.getHandlerForThirdPartyAuth}
          handleValidSignUpCredentials={this.handleSubmitCredentials}
          isSubmitting={this.state.submittingCredentials}
        />
      </AuthPage>
    );
  }
}

export default autoLogin(withAtmosphere(SignUpPage));
