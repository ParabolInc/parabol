/**
 * The form used for signing up via email/password.
 *
 * @flow
 */
import type {Credentials} from 'universal/types/auth';

import React from 'react';
import styled from 'react-emotion';
import {Field, reduxForm} from 'redux-form';

import InputField from 'universal/components/InputField/InputField';
import PrimaryButton from 'universal/components/PrimaryButton/PrimaryButton';
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

const Block = styled('div')(({margin, width}) => ({margin, width}));

const SignInEmailPasswordForm = (props: Props) => (
  <Form onSubmit={props.handleSubmit}>
    <Block margin="1rem 0 2rem" width="16rem">
      <Block margin="0 0 1.5rem">
        <Field
          autoFocus
          component={InputField}
          fieldSize="large"
          type="email"
          placeholder="you@company.co"
          label="Email:"
          name="email"
          underline
          disabled={props.submitting}
        />
      </Block>
      <Field
        component={InputField}
        fieldSize="large"
        type="password"
        placeholder="********"
        label="Password:"
        name="password"
        underline
        disabled={props.submitting}
      />
    </Block>
    <PrimaryButton disabled={!props.valid} waiting={props.submitting} type="submit">
      {'Sign Up'}
    </PrimaryButton>
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
