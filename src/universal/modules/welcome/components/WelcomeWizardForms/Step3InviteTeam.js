import React, {PropTypes} from 'react';
import {Field, reduxForm, change, arrayPush, destroy} from 'redux-form';
import emailAddresses from 'email-addresses';
import Button from 'universal/components/Button/Button';
import InputField from 'universal/components/InputField/InputField';
import LabeledFieldArray from 'universal/containers/LabeledFieldArray/LabeledFieldArrayContainer.js';
import Type from 'universal/components/Type/Type';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import {cashay} from 'cashay';
import {showSuccess} from 'universal/modules/notifications/ducks/notifications';
import {withRouter} from 'react-router';
import withHotkey from 'react-hotkey-hoc';
import {segmentEventTrack} from 'universal/redux/segmentActions';

const emailInviteSuccess = {
  title: 'Invitation sent!',
  message: 'Your team members will get their invite via email'
};

const Step3InviteTeam = (props) => {
  const onAddInviteesButtonClick = event => {
    const {dispatch, inviteesRaw} = props;
    const parsedAddresses = emailAddresses.parseAddressList(inviteesRaw);
    event.preventDefault();
    // clear the inviteesRaw form component:
    dispatch(change('welcomeWizard', 'inviteesRaw', ''));
    if (!parsedAddresses) {
      return;
    }
    parsedAddresses.forEach(email => {
      dispatch(arrayPush('welcomeWizard', 'invitees', {
        email: email.address,
        fullName: email.name,
        label: email.name ? `"${email.name}" <${email.address}>` : email.address
      }));
    });
  };
  props.bindHotkey('enter', onAddInviteesButtonClick);

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

  const {handleSubmit, invitees, inviteesRaw, submitting, teamName, placeholderTheme} = props;

  const invitesFieldHasError = false; // TODO: wire this up for real
  const helpText = invitesFieldHasError ?
    // eslint-disable-next-line max-len
    <span>Oops! Please make sure email addresses are valid <br />and separated by a single comma.</span> :
    <span>You can paste multiple emails separated by a comma.<br />&nbsp;</span>;
  const fieldArrayHasValue = invitees && invitees[0] != null;
  return (
    <div>{/* Div for that flexy flex */}
      <Type align="center" italic scale="s6">
        Sounds like a great team!
      </Type>
      <WelcomeHeading copy={<span>Let’s invite some folks to the <b>{teamName}</b> team.</span>}/>
      <div style={{margin: '0 auto', width: '30rem'}}>
        <Field
          autoFocus={!invitees || invitees.length === 0}
          buttonDisabled={!inviteesRaw}
          buttonIcon="check-circle"
          component={InputField}
          hasButton
          hasErrorText={invitesFieldHasError}
          helpText={helpText}
          isLarger
          isWider
          name="inviteesRaw"
          onButtonClick={onAddInviteesButtonClick}
          placeholder={placeholderTheme.emailMulti}
          type="text"
        />
      </div>
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
  placeholderTheme: PropTypes.object,
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
  destroyOnUnmount: false
  // TODO: add sync + mailgun async validations
})(withRouter(withHotkey(Step3InviteTeam)));
