import React, {Component, PropTypes} from 'react';
import {Field} from 'redux-form';

export default function WelcomeUser(props) {
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
