/**
 * The sign-in UI.
 *
 * @flow
 */

import React from 'react';
import styled from 'react-emotion';
import {Link} from 'react-router-dom';

import appTheme from 'universal/styles/theme/appTheme';

import ThirdPartySignInButton from './ThirdPartySignInButton';
import Separator from './Separator';
import SignInEmailPasswordForm from './SignInEmailPasswordForm';

type AuthProvider = {
  iconName: string,
  displayName: string,
  auth0Connection: string
};

type Props = {
  authProviders: Array<AuthProvider>,
  hasError?: boolean,
  getHandlerForThirdPartyAuth: (auth0Connection: string) => () => void,
  handleSubmitCredentials: ({email: string, password: string}) => void
};

const SignInContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  fontFamily: appTheme.typography.sansSerif
});

export default (props: Props) => (
  <SignInContainer>
    <h1>Sign In</h1>
    <h2>
      or <Link to="/signup">Sign Up</Link>
    </h2>
    {props.hasError &&
      <p>Oops! There was a problem signing you in. Please try again.</p>
    }
    {props.authProviders.map((provider) => (
      <ThirdPartySignInButton
        key={provider.displayName}
        provider={provider}
        handleClick={props.getHandlerForThirdPartyAuth(provider.auth0Connection)}
      />
    ))}
    <Separator text="or" />
    <SignInEmailPasswordForm onSubmit={props.handleSubmitCredentials} />
  </SignInContainer>
);
