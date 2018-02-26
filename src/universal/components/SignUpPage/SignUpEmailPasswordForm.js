/**
 * The form used for signing up via email/password.
 *
 * @flow
 */
import type {Credentials} from 'universal/types/auth';

import React from 'react';
import styled from 'react-emotion';
import {Field, reduxForm} from 'redux-form';

import Button from 'universal/components/Button/Button';
import InputField from 'universal/components/InputField/InputField';
import parseEmailAddressList from 'universal/utils/parseEmailAddressList';
import shouldValidate from 'universal/validation/shouldValidate';

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
        disabled={props.submitting}
      />
      <Field
        component={InputField}
        type="password"
        placeholder="********"
        label="Password:"
        name="password"
        underline
        disabled={props.submitting}
      />
    </FieldsContainer>
    <Button
      waiting={!props.valid || props.submitting}
      type="submit"
      label="Sign Up"
      title="Sign Up"
      colorPalette="warm"
    />
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

export default reduxForm({form: 'signup', shouldValidate, validate})(SignInEmailPasswordForm);
