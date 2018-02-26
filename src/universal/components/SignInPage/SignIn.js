/**
 * The sign-in UI.
 *
 * @flow
 */
import type {StyledComponent, Tag} from 'react-emotion';
import type {ThirdPartyAuthProvider, Credentials} from 'universal/types/auth';

import React, {Fragment} from 'react';
import styled from 'react-emotion';
import {Link} from 'react-router-dom';

import ErrorAlert from 'universal/components/ErrorAlert/ErrorAlert';
import HorizontalSeparator from 'universal/components/HorizontalSeparator/HorizontalSeparator';
import ThirdPartyAuthButton from 'universal/components/ThirdPartyAuthButton/ThirdPartyAuthButton';
import appTheme from 'universal/styles/theme/appTheme';
import SignInEmailPasswordForm from './SignInEmailPasswordForm';

type Props = {
  authProviders: Array<ThirdPartyAuthProvider>,
  getHandlerForThirdPartyAuth: (auth0Connection: string) => () => void,
  handleSubmitCredentials: (Credentials) => Promise<any>,
  error: ?string,
  isSubmitting: boolean
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

export default (props: Props) => (
  <Fragment>
    <H1>Sign In</H1>
    <H2>
      or <BrandedLink to="/signup">Sign Up</BrandedLink>
    </H2>
    {props.authProviders.map((provider) => (
      <ThirdPartyAuthButton
        action="Sign in"
        waiting={props.isSubmitting}
        key={provider.displayName}
        provider={provider}
        handleClick={props.getHandlerForThirdPartyAuth(provider.auth0Connection)}
      />
    ))}
    <HorizontalSeparator text="or" />
    {props.error &&
      <ErrorAlert message={props.error} />
    }
    <SignInEmailPasswordForm onSubmit={props.handleSubmitCredentials} />
  </Fragment>
);
