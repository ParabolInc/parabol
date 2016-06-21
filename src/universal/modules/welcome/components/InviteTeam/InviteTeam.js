import {reduxForm, Field} from 'redux-form';

const InviteTeam = props => {
  const {handleSubmit, pristine, submitting} = props;
  return (
    <div>
      Enter your team members emails & their tasks:
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
}

export default reduxForm({
  form: 'InviteTeam'  // a unique identifier for this form
})(InviteTeam);
