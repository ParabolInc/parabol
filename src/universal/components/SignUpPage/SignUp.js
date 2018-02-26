/**
 * The Sign Up UI.
 *
 * @flow
 */
import type {StyledComponent, Tag} from 'react-emotion';
import type {Credentials, ThirdPartyAuthProvider} from 'universal/types/auth';

import React, {Fragment} from 'react';
import styled from 'react-emotion';
import {Link} from 'react-router-dom';

import ErrorAlert from 'universal/components/ErrorAlert/ErrorAlert';
import HorizontalSeparator from 'universal/components/HorizontalSeparator/HorizontalSeparator';
import ThirdPartyAuthButton from 'universal/components/ThirdPartyAuthButton/ThirdPartyAuthButton';
import appTheme from 'universal/styles/theme/appTheme';
import SignUpEmailPasswordForm from './SignUpEmailPasswordForm';

type Props = {
  authProviders: Array<ThirdPartyAuthProvider>,
  error: ?string,
  getHandlerForThirdPartyAuth: (auth0Connection: string) => () => void,
  handleValidSignUpCredentials: (Credentials) => Promise<any>,
  isSubmitting: boolean
};

const purple = {
  color: appTheme.brand.new.purple
};

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

const H1 = styled('h1')(purple);

const H2 = styled('h2')({
  ...purple,
  fontSize: '1.2rem'
});

const A = newlyStyledLink('a');

const BrandedLink = newlyStyledLink(Link);

const PrivacyFooter = styled('div')({
  marginTop: '1rem'
});

const SignUp = (props: Props) => (
  <Fragment>
    <H1>Sign Up</H1>
    <H2>
      or <BrandedLink to="/signin">Sign In</BrandedLink>
    </H2>
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
      <A href="https://www.parabol.co/privacy" target="_blank" rel="noopener noreferrer">
        Privacy Policy
      </A>.
    </PrivacyFooter>
  </Fragment>
);

export default SignUp;
