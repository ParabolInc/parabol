import React, {PropTypes} from 'react';
import {reduxForm, destroy} from 'redux-form';
import Button from 'universal/components/Button/Button';
import LabeledFieldArray from 'universal/containers/LabeledFieldArray/LabeledFieldArrayContainer.js';
import {cashay} from 'cashay';
import {showSuccess} from 'universal/modules/notifications/ducks/notifications';
import {segmentEventTrack} from 'universal/redux/segmentActions';
import {Link, withRouter} from 'react-router';
import makeStep3Schema from 'universal/validation/makeStep3Schema';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';

const validate = (values) => {
  const schema = makeStep3Schema();
  return schema(values).errors;
};

const emailInviteSuccess = {
  title: 'Invitation sent!',
  message: 'Your team members will get their invite via email'
};

const Step3InviteeList = (props) => {
  const {dispatch, existingInvites, handleSubmit, invitees, router, styles, teamId} = props;
  const onInviteTeamSubmit = () => {
    if (invitees && invitees.length > 0) {
      const serverInvitees = invitees.map(invitee => {
        const {email, fullName, task} = invitee;
        return {
          email,
          fullName,
          task
        };
      });
      const options = {
        variables: {
          teamId,
          invitees: serverInvitees
        }
      };
      cashay.mutate('inviteTeamMembers', options);
    }
    router.push(`/team/${teamId}`);  // redirect leader to their new team

    // loading that user dashboard is really expensive and causes dropped frames, so let's lighten the load
    setTimeout(() => {
      dispatch(segmentEventTrack('Welcome Step3 Completed',
        {inviteeCount: invitees && invitees.length || 0}
      ));
      dispatch(showSuccess(emailInviteSuccess)); // trumpet our leader's brilliance!
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
              System.import('universal/containers/Dashboard/DashboardContainer');
            }}
            size="medium"
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
        System.import('universal/containers/Dashboard/DashboardContainer');
      }}
      onClick={() => {
        dispatch(
          segmentEventTrack('Welcome Step3 Completed', {inviteeCount: 0})
        );
      }}
      title="I'll invite them later"
    >
      Not yet, I just want to kick the tires
    </Link>
  );
};

Step3InviteeList.propTypes = {
  dispatch: PropTypes.func.isRequired,
  existingInvites: PropTypes.array,
  handleSubmit: PropTypes.func.isRequired,
  invitees: PropTypes.array,
  router: PropTypes.object.isRequired,
  styles: PropTypes.object,
  teamId: PropTypes.string.isRequired
};
const styleThunk = () => ({
  noThanks: {
    display: 'inline-block',
    margin: '2rem 0',
    textAlign: 'right',
    textDecoration: 'none',
    width: '100%',
  }
});

export default reduxForm({
  form: 'welcomeWizard',
  destroyOnUnmount: false,
  validate
})(withRouter(withStyles(styleThunk)(Step3InviteeList)));
