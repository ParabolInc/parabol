/**
 * The sign-up page.  Can sign up via email/password or 3rd party auth.
 *
 * @flow
 */

import type {Credentials} from 'universal/types/auth';
import type {Dispatch} from 'redux';

import React, {Component} from 'react';
import {connect} from 'react-redux';

import AuthPage from 'universal/components/AuthPage/AuthPage';
import loginWithToken from 'universal/decorators/loginWithToken/loginWithToken';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {THIRD_PARTY_AUTH_PROVIDERS} from 'universal/utils/constants';
import getWebAuth from 'universal/utils/getWebAuth';
import SignUp from './SignUp';

type Props = {
  atmosphere: Object,
  dispatch: Dispatch<*>,
  hasSession: boolean
};

type State = {
  error: ?{description: string},
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
      this.webAuth.signup({
        email,
        password,
        connection: 'Username-Password-Authentication',
        responseType: 'token'
      }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };

  auth0LogIn = (credentials: Credentials): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.webAuth.login({
        ...credentials,
        realm: 'Username-Password-Authentication',
        responseType: 'token'
      }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };

  webAuth = getWebAuth();

  handleSubmitCredentials = async (credentials: Credentials): Promise<void> => {
    try {
      this.setState({submittingCredentials: true, error: null});
      await this.auth0SignUp(credentials);
      await this.auth0LogIn(credentials);
    } catch (error) {
      this.setState({error});
    } finally {
      this.setState({submittingCredentials: false});
    }
  };

  render() {
    const {error} = this.state;
    return (
      <AuthPage title="Sign Up | Parabol">
        <SignUp
          authProviders={THIRD_PARTY_AUTH_PROVIDERS}
          error={error && error.description}
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
  loginWithToken(
    withAtmosphere(SignUpPage)
  )
);
