/**
 * The form used for signing in via email/password.
 *
 * @flow
 */
import React from 'react';
import {Link} from 'react-router-dom';
import {Field, reduxForm} from 'redux-form';

import Button from 'universal/components/Button/Button';
import InputField from 'universal/components/InputField/InputField';
import shouldValidate from 'universal/validation/shouldValidate';

type Props = {
  handleSubmit: () => void, // Provided by redux-form
  onSubmit: ({email: string, password: string}) => void, // Provided by clients of the exported component
  valid: boolean
};

const formStyles = {
  display: 'flex',
  flexDirection: 'column'
};

const inputWrapperStyles = {
  marginBottom: '2rem'
};

const forgotPasswordStyles = {
  marginTop: '1rem',
  textAlign: 'center'
};

const SignInEmailPasswordForm = (props: Props) => (
  <form style={formStyles} onSubmit={props.handleSubmit}>
    <div style={inputWrapperStyles}>
      <Field
        autoFocus
        component={InputField}
        placeholder="you@company.co"
        label="Email:"
        name="email"
      />
      <Field
        component={InputField}
        placeholder="********"
        label="Password:"
        name="password"
      />
    </div>
    <Button
      disabled={!props.valid}
      type="submit"
      label="Sign In"
      title="Sign In"
      colorPalette="warm"
    />
    <Link to="/reset-password" style={forgotPasswordStyles}>Forgot your password?</Link>
  </form>
);

const validate = (values) => {
  const validation = {};
  if (!values.email) {
    validation.email = 'Enter an email address.';
  }
  if (!values.password) {
    validation.password = 'Enter a password.';
  }
  return validation;
};

export default reduxForm({form: 'signin', shouldValidate, validate})(SignInEmailPasswordForm);
