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

type Props = {
  handleSubmit: () => void, // Provided by redux-form
  onSubmit: ({email: string, password: string}) => void // Provided by clients of the exported component
};

const formStyles = {
  display: 'flex',
  flexDirection: 'column'
};

const inputWrapperStyles = {
  marginBottom: '2rem'
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
    <Link to="/reset-password">Forgot your password?</Link>
    <Button
      type="submit"
      label="Sign In"
      title="Sign In"
      colorPalette="warm"
    />
  </form>
);

export default reduxForm({form: 'signin'})(SignInEmailPasswordForm);
