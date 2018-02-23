/**
 * The Sign Up UI.
 *
 * @flow
 */
import type {Credentials, ThirdPartyAuthProvider} from 'universal/types/auth';

import React, {Fragment} from 'react';
import {Link} from 'react-router-dom';

import ErrorAlert from 'universal/components/ErrorAlert/ErrorAlert';
import HorizontalSeparator from 'universal/components/HorizontalSeparator/HorizontalSeparator';
import ThirdPartyAuthButton from 'universal/components/ThirdPartyAuthButton/ThirdPartyAuthButton';
import SignUpEmailPasswordForm from './SignUpEmailPasswordForm';

type Props = {
  authProviders: Array<ThirdPartyAuthProvider>,
  error: ?string,
  getHandlerForThirdPartyAuth: (auth0Connection: string) => () => void,
  handleValidSignUpCredentials: (Credentials) => any,
  isSubmitting: boolean
};

const SignUp = (props: Props) => (
  <Fragment>
    <h1>Sign Up</h1>
    <h2>
      or <Link to="/signin">Sign In</Link>
    </h2>
    {props.authProviders.map((provider) => (
      <ThirdPartyAuthButton
        action="sign up"
        key={provider.displayName}
        provider={provider}
        disabled={props.isSubmitting}
        handleClick={props.getHandlerForThirdPartyAuth(provider.auth0Connection)}
      />
    ))}
    <HorizontalSeparator text="or" />
    {props.error &&
      <ErrorAlert message={props.error} />
    }
    <SignUpEmailPasswordForm isSubmitting={props.isSubmitting} onSubmit={props.handleValidSignUpCredentials} />
  </Fragment>
);

export default SignUp;
