import React, {PropTypes} from 'react';
import {reduxForm, destroy} from 'redux-form';
import Button from 'universal/components/Button/Button';
import LabeledFieldArray from 'universal/containers/LabeledFieldArray/LabeledFieldArrayContainer.js';
import {cashay} from 'cashay';
import {showSuccess} from 'universal/modules/notifications/ducks/notifications';
import {segmentEventTrack} from 'universal/redux/segmentActions';
import {withRouter} from 'react-router';
import makeStep3Schema from 'universal/validation/makeStep3Schema';

const validate = (values) => {
  const schema = makeStep3Schema();
  return schema(values).errors;
};

const emailInviteSuccess = {
  title: 'Invitation sent!',
  message: 'Your team members will get their invite via email'
};

const Step3InviteeList = (props) => {
  const {dispatch, existingInvites, handleSubmit, invitees, router, submitting, teamId} = props;
  const onInviteTeamSubmit = () => {
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
    router.push(`/team/${teamId}`);  // redirect leader to their new team

    // loading that user dashboard is really expensive and causes dropped frames, so let's lighten the load
    setTimeout(() => {
      dispatch(segmentEventTrack('Welcome Step3 Completed',
        {inviteeCount: serverInvitees.length}
      ));
      dispatch(showSuccess(emailInviteSuccess)); // trumpet our leader's brilliance!
      dispatch(destroy('welcomeWizard')); // bye bye form data!
    }, 1000)
  };

  const fieldArrayHasValue = Array.isArray(invitees);
  return (
    <form onSubmit={handleSubmit(onInviteTeamSubmit)}>
      {fieldArrayHasValue &&
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
      }
      <div style={{margin: '2rem 0 0', textAlign: 'center'}}>
        <Button
          colorPalette="warm"
          disabled={submitting || !fieldArrayHasValue}
          label="Looks Good!"
          onMouseEnter={() => {
            // optimistically fetch the big ol payload
            System.import('universal/containers/Dashboard/DashboardContainer')
          }}
          size="medium"
          type="submit"
        />
      </div>
    </form>
  );
};

export default reduxForm({
  form: 'welcomeWizard',
  destroyOnUnmount: false,
  validate
})(withRouter(Step3InviteeList));


