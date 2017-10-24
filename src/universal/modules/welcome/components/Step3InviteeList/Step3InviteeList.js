import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {Link, withRouter} from 'react-router-dom';
import {destroy, reduxForm} from 'redux-form';
import Button from 'universal/components/Button/Button';
import LabeledFieldArray from 'universal/containers/LabeledFieldArray/LabeledFieldArrayContainer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import InviteTeamMembersMutation from 'universal/mutations/InviteTeamMembersMutation';
import SendClientSegmentEventMutation from 'universal/mutations/SendClientSegmentEventMutation';
import withStyles from 'universal/styles/withStyles';
import makeStep3Schema from 'universal/validation/makeStep3Schema';

const validate = (values) => {
  const schema = makeStep3Schema();
  return schema(values).errors;
};

const Step3InviteeList = (props) => {
  const {atmosphere, dispatch, existingInvites, handleSubmit, invitees, history, styles, teamId} = props;
  const onInviteTeamSubmit = () => {
    const inviteeCount = invitees && invitees.length || 0;
    if (inviteeCount > 0) {
      const serverInvitees = invitees.map((invitee) => {
        const {email, fullName, task} = invitee;
        return {
          email,
          fullName,
          task
        };
      });
      InviteTeamMembersMutation(atmosphere, serverInvitees, teamId, dispatch);
    }
    history.push(`/team/${teamId}`); // redirect leader to their new team

    // loading that user dashboard is really expensive and causes dropped frames, so let's lighten the load
    setTimeout(() => {
      SendClientSegmentEventMutation(atmosphere, 'Welcome Step3 Completed', {inviteeCount});
      dispatch(destroy('welcomeWizard')); // bye bye form data!
    }, 1000);
  };

  const fieldArrayHasValue = invitees && invitees.length > 0;
  if (fieldArrayHasValue) {
    return (
      <form onSubmit={handleSubmit(onInviteTeamSubmit)}>
        <div style={{margin: '2rem 0 0'}}>
          <LabeledFieldArray
            existingInvites={existingInvites}
            invitees={invitees}
            labelHeader="Invitee"
            labelSource="invitees"
            nestedFieldHeader="This Week’s Priority (optional)"
            nestedFieldName="task"
          />
        </div>
        <div style={{margin: '2rem 0 0', textAlign: 'center'}}>
          <Button
            colorPalette="warm"
            label="Looks Good!"
            onMouseEnter={() => {
              // optimistically fetch the big ol payload
              System.import('universal/modules/teamDashboard/containers/Team/TeamContainer');
            }}
            buttonSize="large"
            type="submit"
          />
        </div>
      </form>
    );
  }
  return (
    <Link
      to={`/team/${teamId}`}
      className={css(styles.noThanks)}
      onMouseEnter={() => {
        System.import('universal/modules/teamDashboard/containers/Team/TeamContainer');
      }}
      onClick={() => {
        SendClientSegmentEventMutation(atmosphere, 'Welcome Step3 Completed', {inviteeCount: 0});
      }}
      style={{margin: '1rem auto', maxWidth: '45.5rem', padding: '0 2.5rem'}}
      title="I’ll invite them later"
    >
      {'Not yet, I just want to kick the tires'}
    </Link>
  );
};

Step3InviteeList.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  existingInvites: PropTypes.array,
  handleSubmit: PropTypes.func.isRequired,
  invitees: PropTypes.array,
  history: PropTypes.object.isRequired,
  styles: PropTypes.object,
  teamId: PropTypes.string.isRequired
};
const styleThunk = () => ({
  noThanks: {
    display: 'inline-block',
    margin: '2rem 0',
    textAlign: 'right',
    textDecoration: 'none',
    width: '100%'
  }
});

export default withAtmosphere(reduxForm({
  form: 'welcomeWizard',
  destroyOnUnmount: false,
  validate
})(withRouter(withStyles(styleThunk)(Step3InviteeList))));
