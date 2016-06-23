import React, {PropTypes} from 'react';
import {reduxForm, Field} from 'redux-form';

// TODO sync validation & parsing
// TODO async validation via mailgun on submit
const InviteTeam = props => {
  const {handleSubmit, pristine, submitting} = props;
  return (
    <div>
      Enter your team members emails & their tasks. THIS IS BROKEN UNTIL WE DO PARSING:
      <form onSubmit={handleSubmit(props.onSubmit)}>
        <Field
          name="inviteeEmail"
          component="input"
          type="text"
          autoFocus
        />
        <Field
          name="inviteeTask"
          component="input"
          type="text"
        />
        <button type="submit" disabled={pristine || submitting}>Next</button>
      </form>
    </div>
  );
};

InviteTeam.propTypes = {
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func
};

export default reduxForm({
  form: 'InviteTeam'  // a unique identifier for this form
})(InviteTeam);
