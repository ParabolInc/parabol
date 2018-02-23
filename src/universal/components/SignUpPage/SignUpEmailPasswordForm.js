/**
 * The form used for signing up via email/password.
 *
 * @flow
 */
import React from 'react';
import styled from 'react-emotion';
import {Field, reduxForm} from 'redux-form';

import Button from 'universal/components/Button/Button';
import InputField from 'universal/components/InputField/InputField';
import shouldValidate from 'universal/validation/shouldValidate';

type Props = {
  handleSubmit: () => void, // Provided by redux-form
  onSubmit: ({email: string, password: string, confirmedPassword: string}) => void, // Provided by clients of the exported component
  valid: boolean
};

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column'
});

const FieldsContainer = styled('div')({
  marginBottom: '2rem'
});

const SignInEmailPasswordForm = (props: Props) => (
  <Form onSubmit={props.handleSubmit}>
    <FieldsContainer>
      <Field
        autoFocus
        component={InputField}
        type="email"
        placeholder="you@company.co"
        label="Email:"
        name="email"
        underline
      />
      <Field
        component={InputField}
        type="password"
        placeholder="********"
        label="Password:"
        name="password"
        underline
      />
      <Field
        component={InputField}
        type="password"
        placeholder="********"
        label="Confirm Password:"
        name="confirmedPassword"
        underline
      />
    </FieldsContainer>
    <Button
      disabled={!props.valid}
      type="submit"
      label="Sign Up"
      title="Sign Up"
      colorPalette="warm"
    />
  </Form>
);

const validate = (values) => {
  const validation = {};
  if (!values.email) {
    validation.email = 'Enter an email address.';
  }
  if (!values.password) {
    validation.password = 'Enter a password.';
  }
  if (values.password !== values.confirmedPassword) {
    validation.confirmedPassword = 'Passwords do not match';
  }
  if (!values.confirmedPassword) {
    validation.confirmedPassword = 'Confirm your password.';
  }
  return validation;
};

export default reduxForm({form: 'signup', shouldValidate, validate})(SignInEmailPasswordForm);
