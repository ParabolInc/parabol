/**
 * The form used to reset a password.
 *
 * @flow
 */

import React from 'react';
import styled from 'react-emotion';
import {Field, reduxForm} from 'redux-form';

import PrimaryButton from 'universal/components/PrimaryButton/PrimaryButton';
import InputField from 'universal/components/InputField/InputField';
import parseEmailAddressList from 'universal/utils/parseEmailAddressList';
import shouldValidate from 'universal/validation/shouldValidate';

type Props = {
  handleSubmit: () => void, // from redux-form
  onSubmit: ({email: string}) => Promise<any>, // from parents of this component
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

const PasswordResetForm = (props: Props) => {
  return (
    <Form onSubmit={props.handleSubmit}>
      <FieldsContainer>
        <Field
          type="email"
          autoFocus
          component={InputField}
          placeholder="you@company.co"
          label="Email:"
          name="email"
          underline
          disabled={props.submitting}
        />
      </FieldsContainer>
      <PrimaryButton disabled={!props.valid} waiting={props.submitting} type="submit">
        Submit
      </PrimaryButton>
    </Form>
  );
};

const validate = ({email}) => ({
  email: parseEmailAddressList(email)
    ? null
    : 'Enter a valid email address'
});

export default reduxForm({form: 'passwordReset', shouldValidate, validate})(PasswordResetForm);
