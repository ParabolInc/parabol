/**
 * The password reset page. Allows the user to reset their password via email.
 *
 * @flow
 */

import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import AuthPage from 'universal/components/AuthPage/AuthPage';
import HorizontalSeparator from 'universal/components/HorizontalSeparator/HorizontalSeparator';
import {AUTH0_DB_CONNECTION} from 'universal/utils/constants';
import getWebAuth from 'universal/utils/getWebAuth';
import PasswordReset from './ResetPassword';

type Props = {};

type State = {
  error: ?string,
  emailSent: boolean
};

export default class PasswordResetPage extends Component<Props, State> {
  state = {
    error: null,
    emailSent: false
  };

  webAuth = getWebAuth();

  auth0ChangePassword = ({email}: {email: string}): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.webAuth.changePassword({
        connection: AUTH0_DB_CONNECTION,
        email
      }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };

  handleSubmitResetPassword = async ({email}: {email: string}): Promise<void> => {
    try {
      await this.auth0ChangePassword({email});
      this.setState({emailSent: true, error: null});
    } catch (error) {
      this.setState({error: error.message});
    }
  };

  resetState = () => {
    this.setState({error: null, emailSent: false});
  };

  render() {
    const {error, emailSent} = this.state;
    return (
      <AuthPage title="Reset Password | Parabol">
        <h1>
          Forgot your password?
        </h1>
        <h2>
          <Link to="/signin">Back to Sign in</Link>
        </h2>
        <HorizontalSeparator />
        <PasswordReset
          error={error}
          emailSent={emailSent}
          handleSubmitResetPassword={this.handleSubmitResetPassword}
          tryAgain={this.resetState}
        />
      </AuthPage>
    );
  }
}
