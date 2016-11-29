import React, {PropTypes} from 'react';
import {Field, reduxForm, change, arrayPush, destroy} from 'redux-form';
import Button from 'universal/components/Button/Button';
import LabeledFieldArray from 'universal/containers/LabeledFieldArray/LabeledFieldArrayContainer.js';
import Type from 'universal/components/Type/Type';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import {cashay} from 'cashay';
import {showSuccess} from 'universal/modules/notifications/ducks/notifications';
import {withRouter} from 'react-router';
import {segmentEventTrack} from 'universal/redux/segmentActions';
import Step3RawInvitees from 'universal/modules/welcome/components/Step3RawInvitees/Step3RawInvitees';

const emailInviteSuccess = {
  title: 'Invitation sent!',
  message: 'Your team members will get their invite via email'
};

const Step3InviteTeam = (props) => {
  const onInviteTeamSubmit = async(submissionData) => {
    const {dispatch, router, welcome: {teamId}} = props;
    const serverInvitees = submissionData.invitees.map(invitee => {
      // Remove label field:
      const {label, ...inviteeForServer} = invitee; // eslint-disable-line no-unused-vars
      return inviteeForServer;
    });
    const options = {
      variables: {
        teamId,
        invitees: serverInvitees
      }
    };

    const {error, data} = await cashay.mutate('inviteTeamMembers', options);
    if (error) {
      const {errors} = error;
      if (errors) {
        console.warn('an error other than the 1 we expected occured. we need a pattern to fix this');
      }
    } else if (data) {
      router.push(`/team/${teamId}`);  // redirect leader to their new team
      dispatch(segmentEventTrack('Welcome Step3 Completed',
        { inviteeCount: serverInvitees.length }
      ));
      dispatch(showSuccess(emailInviteSuccess)); // trumpet our leader's brilliance!
      dispatch(destroy('welcomeWizard')); // bye bye form data!
    }
  };

  const {handleSubmit, invitees, inviteesRaw, submitting, teamName} = props;

  const fieldArrayHasValue = invitees && invitees[0] != null;
  return (
    <div>{/* Div for that flexy flex */}
      <Type align="center" italic scale="s6">
        Sounds like a great team!
      </Type>
      <WelcomeHeading copy={<span>Let’s invite some folks to the <b>{teamName}</b> team.</span>}/>
      <Step3RawInvitees doFocus={!invitees || invitees.length === 0} inviteesRaw={inviteesRaw}/>
      <form onSubmit={handleSubmit(onInviteTeamSubmit)}>
        {fieldArrayHasValue &&
          <div style={{margin: '2rem 0 0'}}>
            <LabeledFieldArray
              labelGetter={(idx) => invitees[idx].label}
              labelHeader="Invitee"
              labelSource="invitees"
              nestedFieldHeader="This Week’s Priority (optional)"
              nestedFieldName="task"
            />
          </div>
        }
        <div style={{margin: '2rem 0 0', textAlign: 'center'}}>
          <Button
            disabled={submitting || !fieldArrayHasValue}
            label="Looks Good!"
            colorPalette="warm"
            size="medium"
            type="submit"
          />
        </div>
      </form>
    </div>
  );
};

Step3InviteTeam.propTypes = {
  bindHotkey: PropTypes.func,
  dispatch: PropTypes.func,
  handleSubmit: PropTypes.func,
  invitees: PropTypes.array,
  inviteesRaw: PropTypes.string,
  onSubmit: PropTypes.func,
  router: PropTypes.object,
  submitting: PropTypes.bool,
  teamName: PropTypes.string,
  welcome: PropTypes.shape({
    teamId: PropTypes.string,
  })
};

export default
reduxForm({
  form: 'welcomeWizard',
  destroyOnUnmount: false,
  // validate
  // TODO: add sync + mailgun async validations
})(withRouter(Step3InviteTeam));
