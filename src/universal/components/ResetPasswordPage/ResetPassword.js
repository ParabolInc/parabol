/**
 * Renders the password reset UI.
 *
 * @flow
 */

import React, {Fragment} from 'react';
import styled from 'react-emotion';

import PlainButton from 'universal/components/PlainButton/PlainButton';
import ErrorAlert from 'universal/components/ErrorAlert/ErrorAlert';
import PasswordResetForm from './ResetPasswordForm';

type Props = {
  error: ?string,
  emailSent: boolean,
  handleSubmitResetPassword: ({ email: string }) => Promise<any>,
  tryAgain: () => void
};

const P = styled('p')({
  textAlign: 'center',
  margin: '1rem 0'
});

const LinkButton = styled(PlainButton)({
  textDecoration: 'underline'
});

const PasswordReset = (props: Props) => (
  <Fragment>
    {props.error && <ErrorAlert message={props.error} />}
    {props.emailSent ? (
      <Fragment>
        <P>You’re all set!</P>
        <P>We’ve sent you an email with password recovery instructions.</P>
        <P>
          Didn’t get it? Check your spam folder, or <LinkButton onClick={props.tryAgain}>click here</LinkButton> to try again.
        </P>
      </Fragment>
    ) : (
      <Fragment>
        <P>Confirm your email address, and we’ll send you an email with password recovery instructions.</P>
        <PasswordResetForm onSubmit={props.handleSubmitResetPassword} />
      </Fragment>
    )}
  </Fragment>
);

export default PasswordReset;
