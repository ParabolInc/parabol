import React, {PropTypes} from 'react';
import {reduxForm, change, arrayPush, destroy} from 'redux-form';
import {HotKeys} from 'react-hotkeys';
import emailAddresses from 'email-addresses';
import Button from 'universal/components/Button/Button';
import Field from 'universal/components/Field/Field';
import LabeledFieldArray from 'universal/components/LabeledFieldArray/LabeledFieldArray';
import Type from 'universal/components/Type/Type';
import ProgressDots from '../ProgressDots/ProgressDots';
import WelcomeContent from '../WelcomeContent/WelcomeContent';
import WelcomeHeader from '../WelcomeHeader/WelcomeHeader';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import WelcomeLayout from '../WelcomeLayout/WelcomeLayout';
import {goToPage} from 'universal/modules/welcome/ducks/welcomeDuck';
import {cashay} from 'cashay';
import {show} from 'universal/modules/notifications/ducks/notifications';
import {push} from 'react-router-redux';

const emailInviteSuccess = {
  title: 'Invitation sent!',
  message: 'Your team members will get their invite via email',
  level: 'success'
};

// TODO why is this showing up green like success?
const emailInviteFail = emailsNotDelivered => ({
  title: 'Invitations not sent!',
  message: `The following emails were not sent: ${emailsNotDelivered}`,
  level: 'error'
});

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

  const onInviteTeamSubmit = async submissionData => {
    const {dispatch, welcome: {teamId}} = props;
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
      const {failedEmails, errors} = error;
      if (errors) {
        console.warn('an error other than the 1 we expected occured. we need a pattern to fix this');
      }
      if (Array.isArray(failedEmails)) {
        const emailsNotDelivered = failedEmails.map(invitee => invitee.email).join(', ');
        dispatch(show(emailInviteFail(emailsNotDelivered)));
        // TODO I think we want to remove the failures from the array so they can click try again. thoughts?
      }
    } else if (data) {
      dispatch(push(`/team/${teamId}`));  // redirect leader to their new team
      dispatch(show(emailInviteSuccess)); // trumpet our leader's brilliance!
      dispatch(destroy('welcomeWizard')); // bye bye form data!
    }
  };

  const {handleSubmit, invitees, inviteesRaw, submitting, teamName} = props;

  const invitesFieldHasError = false; // TODO: wire this up for real
  const helpText = invitesFieldHasError ?
    // eslint-disable-next-line max-len
    <span>Oops! Please make sure email addresses are valid <br />and separated by a single comma.</span> :
    <span>You can paste multiple emails separated by a comma.<br />&nbsp;</span>;
  const fieldArrayHasValue = invitees && invitees[0] != null;
  const progressDotClick = (dot) => {
    if (dot !== 3) {
      props.dispatch(goToPage(dot));
    }
  };
  return (
    <WelcomeLayout>
      <WelcomeHeader heading={<span>Invite your team.</span>}/>
      <WelcomeContent>
        <ProgressDots
          numDots={3}
          numCompleted={3}
          currentDot={3}
          onClick={progressDotClick}
        />
        <div>{/* Div for that flexy flex */}
          <Type align="center" italic scale="s6">
            Sounds like a great team!
          </Type>
          <WelcomeHeading copy={<span>Let’s invite some folks to the <b>{teamName}</b> team.</span>}/>
          <HotKeys handlers={{ keyEnter: onAddInviteesButtonClick}}>
            <div style={{margin: '0 auto', width: '30rem'}}>
              <Field
                autoFocus={!invitees || invitees.length === 0}
                buttonDisabled={!inviteesRaw}
                buttonIcon="check-circle"
                hasButton
                hasErrorText={invitesFieldHasError}
                hasHelpText
                helpText={helpText}
                isLarger
                isWider
                name="inviteesRaw"
                onButtonClick={onAddInviteesButtonClick}
                placeholder="b.bunny@acme.co, d.duck@acme.co, e.fudd@acme.co"
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
                    nestedFieldHeader="This Week's Priority"
                    nestedFieldName="task"
                  />
                </div>
              }
              <div style={{margin: '2rem 0 0', textAlign: 'center'}}>
                <Button
                  disabled={submitting || !fieldArrayHasValue}
                  label="Look’s Good!"
                  theme="warm"
                  type="submit"
                />
              </div>
            </form>
          </HotKeys>
        </div>
      </WelcomeContent>
    </WelcomeLayout>
  );
};

Step3InviteTeam.propTypes = {
  dispatch: PropTypes.func,
  handleSubmit: PropTypes.func,
  invitees: PropTypes.array,
  inviteesRaw: PropTypes.string,
  onSubmit: PropTypes.func,
  submitting: PropTypes.bool,
  teamName: PropTypes.string,
  welcome: PropTypes.shape({
    teamId: PropTypes.string,
  })
};

export default reduxForm({
  form: 'welcomeWizard',
  destroyOnUnmount: false
  // TODO: add sync + mailgun async validations
})(Step3InviteTeam);
