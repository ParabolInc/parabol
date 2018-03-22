/**
 * The sign-in UI.
 *
 * @flow
 */
import type {ThirdPartyAuthProvider, Credentials} from 'universal/types/auth';
import React, {Fragment} from 'react';
import {
  AuthHeader,
  ErrorAlert,
  HorizontalSeparator,
  ThirdPartyAuthButton
} from 'universal/components';
import SignInEmailPasswordForm from './SignInEmailPasswordForm';

type Props = {
  authProviders: Array<ThirdPartyAuthProvider>,
  getHandlerForThirdPartyAuth: (auth0Connection: string) => () => void,
  handleSubmitCredentials: (Credentials) => Promise<any>,
  error: ?string,
  isSubmitting: boolean
};

export default (props: Props) => (
  <Fragment>
    <AuthHeader
      heading="Sign In"
      secondaryAction={{relativeUrl: '/signup', displayName: 'Sign Up'}}
    />
    {props.authProviders.map((provider) => (
      <ThirdPartyAuthButton
        action="Sign in"
        waiting={props.isSubmitting}
        key={provider.displayName}
        provider={provider}
        handleClick={props.getHandlerForThirdPartyAuth(provider.auth0Connection)}
      />
    ))}
    <HorizontalSeparator margin="1rem 0 0" text="or" />
    {props.error &&
      <ErrorAlert message={props.error} />
    }
    <SignInEmailPasswordForm onSubmit={props.handleSubmitCredentials} />
  </Fragment>
);
