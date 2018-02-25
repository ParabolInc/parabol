/**
 * The Sign Up UI.
 *
 * @flow
 */
import type {Credentials, ThirdPartyAuthProvider} from 'universal/types/auth';

import React, {Fragment} from 'react';
import styled from 'react-emotion';
import {Link} from 'react-router-dom';

import ErrorAlert from 'universal/components/ErrorAlert/ErrorAlert';
import HorizontalSeparator from 'universal/components/HorizontalSeparator/HorizontalSeparator';
import ThirdPartyAuthButton from 'universal/components/ThirdPartyAuthButton/ThirdPartyAuthButton';
import SignUpEmailPasswordForm from './SignUpEmailPasswordForm';

type Props = {
  authProviders: Array<ThirdPartyAuthProvider>,
  error: ?string,
  getHandlerForThirdPartyAuth: (auth0Connection: string) => () => void,
  handleValidSignUpCredentials: (Credentials) => Promise<any>,
  isSubmitting: boolean
};

const PrivacyFooter = styled('div')({
  marginTop: '1rem'
});

const SignUp = (props: Props) => (
  <Fragment>
    <h1>Sign Up</h1>
    <h2>
      or <Link to="/signin">Sign In</Link>
    </h2>
    {props.authProviders.map((provider) => (
      <ThirdPartyAuthButton
        action="Sign up"
        key={provider.displayName}
        provider={provider}
        waiting={props.isSubmitting}
        handleClick={props.getHandlerForThirdPartyAuth(provider.auth0Connection)}
      />
    ))}
    <HorizontalSeparator text="or" />
    {props.error && <ErrorAlert message={props.error} />}
    <SignUpEmailPasswordForm onSubmit={props.handleValidSignUpCredentials} />
    <PrivacyFooter>
      By creating an account, you agree to our{' '}
      <a href="https://www.parabol.co/privacy" target="_blank" rel="noopener noreferrer">
        Privacy Policy
      </a>.
    </PrivacyFooter>
  </Fragment>
);

export default SignUp;
