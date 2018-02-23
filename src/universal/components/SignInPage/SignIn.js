/**
 * The sign-in UI.
 *
 * @flow
 */

import type {ThirdPartyAuthProvider, Credentials} from 'universal/types/auth';

import React, {Fragment} from 'react';
import {Link} from 'react-router-dom';

import ThirdPartyAuthButton from 'universal/components/ThirdPartyAuthButton/ThirdPartyAuthButton';
import HorizontalSeparator from 'universal/components/HorizontalSeparator/HorizontalSeparator';
import SignInEmailPasswordForm from './SignInEmailPasswordForm';

type Props = {
  authProviders: Array<ThirdPartyAuthProvider>,
  hasError?: boolean,
  getHandlerForThirdPartyAuth: (auth0Connection: string) => () => void,
  handleSubmitCredentials: (Credentials) => void
};

export default (props: Props) => (
  <Fragment>
    <h1>Sign In</h1>
    <h2>
      or <Link to="/signup">Sign Up</Link>
    </h2>
    {props.hasError &&
      <p>Oops! There was a problem signing you in. Please try again.</p>
    }
    {props.authProviders.map((provider) => (
      <ThirdPartyAuthButton
        action="sign in"
        key={provider.displayName}
        provider={provider}
        handleClick={props.getHandlerForThirdPartyAuth(provider.auth0Connection)}
      />
    ))}
    <HorizontalSeparator text="or" />
    <SignInEmailPasswordForm onSubmit={props.handleSubmitCredentials} />
  </Fragment>
);
