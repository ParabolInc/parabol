/**
 * The password reset page. Allows the user to reset their password via email.
 *
 * @flow
 */
import type {StyledComponent, Tag} from 'react-emotion';

import React, {Component} from 'react';
import styled from 'react-emotion';
import {Link} from 'react-router-dom';

import AuthPage from 'universal/components/AuthPage/AuthPage';
import HorizontalSeparator from 'universal/components/HorizontalSeparator/HorizontalSeparator';
import appTheme from 'universal/styles/theme/appTheme';
import {AUTH0_DB_CONNECTION} from 'universal/utils/constants';
import getWebAuth from 'universal/utils/getWebAuth';
import PasswordReset from './ResetPassword';

type Props = {};

type State = {
  error: ?string,
  emailSent: boolean
};

const purple = {
  color: appTheme.brand.new.purple
};

const H1 = styled('h1')(purple);

const H2 = styled('h2')({
  ...purple,
  fontSize: '1.2rem'
});

const linkStyles = {
  ...purple,
  textDecoration: 'underline'
};

const newlyStyledLink = (tag: Tag): StyledComponent<*> => (
  styled(tag)({
    ...linkStyles,
    ':hover': linkStyles,
    ':focus': linkStyles
  })
);

const BrandedLink = newlyStyledLink(Link);

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
        <H1>
          Forgot your password?
        </H1>
        <H2>
          <BrandedLink to="/signin">Back to Sign in</BrandedLink>
        </H2>
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
