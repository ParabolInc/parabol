/**
 * The sign-in UI.
 *
 * @flow
 */

import type {ThirdPartyAuthProvider, Credentials} from 'universal/types/auth';

import React, {Fragment} from 'react';
import {Link} from 'react-router-dom';

import ErrorAlert from 'universal/components/ErrorAlert/ErrorAlert';
import HorizontalSeparator from 'universal/components/HorizontalSeparator/HorizontalSeparator';
import ThirdPartyAuthButton from 'universal/components/ThirdPartyAuthButton/ThirdPartyAuthButton';
import SignInEmailPasswordForm from './SignInEmailPasswordForm';

type Props = {
  authProviders: Array<ThirdPartyAuthProvider>,
  getHandlerForThirdPartyAuth: (auth0Connection: string) => () => void,
  handleSubmitCredentials: (Credentials) => void,
  error: ?string,
  isSubmitting: boolean
};

export default (props: Props) => (
  <Fragment>
    <h1>Sign In</h1>
    <h2>
      or <Link to="/signup">Sign Up</Link>
    </h2>
    {props.authProviders.map((provider) => (
      <ThirdPartyAuthButton
        action="sign in"
        disabled={props.isSubmitting}
        key={provider.displayName}
        provider={provider}
        handleClick={props.getHandlerForThirdPartyAuth(provider.auth0Connection)}
      />
    ))}
    <HorizontalSeparator text="or" />
    {props.error &&
      <ErrorAlert message={props.error} />
    }
    <SignInEmailPasswordForm isSubmitting={props.isSubmitting} onSubmit={props.handleSubmitCredentials} />
  </Fragment>
);
