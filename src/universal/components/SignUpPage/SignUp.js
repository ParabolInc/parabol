/**
 * The Sign Up UI.
 *
 * @flow
 */
import type {ThirdPartyAuthProvider} from 'universal/types/auth';

import React, {Fragment} from 'react';
import {Link} from 'react-router-dom';

import HorizontalSeparator from 'universal/components/HorizontalSeparator/HorizontalSeparator';
import ThirdPartyAuthButton from 'universal/components/ThirdPartyAuthButton/ThirdPartyAuthButton';
import SignUpEmailPasswordForm from './SignUpEmailPasswordForm';

type Props = {
  authProviders: Array<ThirdPartyAuthProvider>,
  handleValidSignUpCredentials: (credentials: ({email: string, password: string, confirmedPassword: string})) => any
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
        handleClick={() => console.log('Not yet implemented!')}
      />
    ))}
    <HorizontalSeparator text="or" />
    <SignUpEmailPasswordForm onSubmit={props.handleValidSignUpCredentials} />
  </Fragment>
);

export default SignUp;
