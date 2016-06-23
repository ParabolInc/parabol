import React, {PropTypes} from 'react';
import {reduxForm, Field} from 'redux-form';

const WelcomeTeam = props => {
  const {handleSubmit, pristine, submitting} = props;
  return (
    <div>
      Please type in your team name:
      <form onSubmit={handleSubmit(props.onSubmit)}>
        <Field
          name="teamName"
          component="input"
          type="text"
          autoFocus
        />
        <button type="submit" disabled={pristine || submitting}>Next</button>
      </form>
    </div>
  );
};

WelcomeTeam.propTypes = {
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func
};

export default reduxForm({
  form: 'welcomeTeam'  // a unique identifier for this form
})(WelcomeTeam);
