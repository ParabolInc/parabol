import React, {Component, PropTypes} from 'react';
import {reduxForm, Field} from 'redux-form';

const WelcomeFullName = props => {
  const {handleSubmit, pristine, submitting} = props;
  return (
    <div>
      Please type in your name:
      <form onSubmit={handleSubmit(props.onSubmit)}>
        <Field
          name="fullName"
          component="input"
          type="text"
          autoFocus
        />
        <button type="submit" disabled={pristine || submitting}>Next</button>
      </form>
    </div>
  );
}

export default reduxForm({
  form: 'welcomeFullName'  // a unique identifier for this form
})(WelcomeFullName);
