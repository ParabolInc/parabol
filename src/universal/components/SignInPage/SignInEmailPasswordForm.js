/**
 * The form used for signing in via email/password.
 *
 * @flow
 */
import type {Credentials} from 'universal/types/auth';
import React from 'react';
import styled from 'react-emotion';
import {Link} from 'react-router-dom';
import {Field, reduxForm} from 'redux-form';
import {InputField, Button} from 'universal/components';
import parseEmailAddressList from 'universal/utils/parseEmailAddressList';
import shouldValidate from 'universal/validation/shouldValidate';
import appTheme from 'universal/styles/theme/appTheme';

type Props = {
  handleSubmit: () => void, // Provided by redux-form
  onSubmit: (Credentials) => Promise<any>, // Provided by clients of the exported component
  submitting: boolean,
  valid: boolean
};

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column'
});

const Block = styled('div')(({margin, width}) => ({margin, width}));

const linkStyles = {
  color: appTheme.brand.primary.purple,
  textDecoration: 'underline'
};

const ForgotPasswordLink = styled(Link)({
  ...linkStyles,
  ':hover': linkStyles,
  marginTop: '1rem',
  textAlign: 'center'
});

const SignInEmailPasswordForm = (props: Props) => (
  <Form className="signin-form" onSubmit={props.handleSubmit}>
    <Block margin="1rem 0 2rem" width="16rem">
      <Block margin="0 0 1.5rem">
        <Field
          type="email"
          autoFocus
          component={InputField}
          fieldSize="large"
          placeholder="you@company.co"
          label="Email:"
          name="email"
          underline
          disabled={props.submitting}
        />
      </Block>
      <Field
        type="password"
        component={InputField}
        fieldSize="large"
        placeholder="********"
        label="Password:"
        name="password"
        underline
        disabled={props.submitting}
      />
    </Block>
    <Button
      buttonSize="large"
      buttonStyle="primary"
      disabled={!props.valid}
      label="Sign In"
      type="submit"
      waiting={props.submitting}
    />
    <ForgotPasswordLink to="/reset-password">{'Forgot your password?'}</ForgotPasswordLink>
  </Form>
);

const validate = (values) => {
  const validation = {};
  if (!parseEmailAddressList(values.email)) {
    validation.email = 'Enter a valid email address.';
  }
  if (!values.password) {
    validation.password = 'Enter a password.';
  }
  return validation;
};

export default reduxForm({form: 'signin', shouldValidate, validate})(SignInEmailPasswordForm);
