/**
 * The Sign Up UI.
 *
 * @flow
 */
import type {Credentials, ThirdPartyAuthProvider} from 'universal/types/auth';
import React, {Fragment} from 'react';
import styled from 'react-emotion';
import {AuthHeader, ErrorAlert, HorizontalSeparator, ThirdPartyAuthButton} from 'universal/components';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import SignUpEmailPasswordForm from './SignUpEmailPasswordForm';
import {withRouter} from 'react-router-dom';
import type {Location} from 'react-router-dom';

type Props = {
  authProviders: Array<ThirdPartyAuthProvider>,
  error: ?string,
  getHandlerForThirdPartyAuth: (auth0Connection: string) => () => void,
  handleValidSignUpCredentials: (Credentials) => Promise<any>,
  location: Location,
  isSubmitting: boolean
};

const purple = {
  color: appTheme.brand.primary.purple
};

const linkStyles = {
  ...purple,
  textDecoration: 'underline'
};

const A = styled('a')({
  ...linkStyles,
  ':hover': linkStyles,
  marginTop: '1rem',
  textAlign: 'center'
});

const PrivacyFooter = styled('div')({
  color: ui.hintFontColor,
  fontSize: ui.hintFontSize,
  marginTop: '1rem',
  textAlign: 'center'
});

const SignUp = (props: Props) => {
  const {location} = props;
  const relativeUrl = `/signin${location.search}`;
  return (
    <Fragment>
      <AuthHeader
        heading="Sign Up"
        secondaryAction={{relativeUrl, displayName: 'Sign In'}}
      />
      {props.authProviders.map((provider) => (
        <ThirdPartyAuthButton
          action="Sign up"
          key={provider.displayName}
          provider={provider}
          waiting={props.isSubmitting}
          handleClick={props.getHandlerForThirdPartyAuth(provider.auth0Connection)}
        />
      ))}
      <HorizontalSeparator margin="1rem 0 0" text="or" />
      {props.error && <ErrorAlert message={props.error} />}
      <SignUpEmailPasswordForm onSubmit={props.handleValidSignUpCredentials} />
      <PrivacyFooter>
        {'By creating an account, you agree to our '}
        <A href="https://www.parabol.co/privacy" target="_blank" rel="noopener noreferrer" title="Privacy Policy">
          {'Privacy Policy'}
        </A>.
      </PrivacyFooter>
    </Fragment>
  );
}

export default withRouter(SignUp);
