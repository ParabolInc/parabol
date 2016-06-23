import React, {Component, PropTypes} from 'react';
import {reduxForm, Field} from 'redux-form';

const WelcomePreferredName = props => {
  const {handleSubmit, pristine, submitting} = props;
  return (
    <div>
      Please type in your name:
      <form onSubmit={handleSubmit(props.onSubmit)}>
        <Field
          name="preferredName"
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
  form: 'welcomePreferredName'  // a unique identifier for this form
})(WelcomePreferredName);
