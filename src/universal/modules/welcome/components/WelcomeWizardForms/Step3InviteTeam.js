import React, {PropTypes, Component} from 'react';
import {reduxForm, change, arrayPush} from 'redux-form';
import {HotKeys} from 'react-hotkeys';
import emailAddresses from 'email-addresses';
import Field from 'universal/components/Field/Field';
import LabeledFieldArray from 'universal/components/LabeledFieldArray/LabeledFieldArray';
import Type from 'universal/components/Type/Type';
import ProgressDots from '../ProgressDots/ProgressDots';
import WelcomeContent from '../WelcomeContent/WelcomeContent';
import WelcomeHeader from '../WelcomeHeader/WelcomeHeader';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import WelcomeLayout from '../WelcomeLayout/WelcomeLayout';

// TODO sync validation & parsing
// TODO async validation via mailgun on submit
@reduxForm({
  form: 'welcomeWizard',
  destroyOnUnmount: false,
  // TODO: add validations
})
export default class Step3InviteTeam extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    handleSubmit: PropTypes.func,
    invitees: PropTypes.array,
    inviteesRaw: PropTypes.string,
    onSubmit: PropTypes.func,
    teamName: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);
    this.onAddInviteesButtonClick = this.onAddInviteesButtonClick.bind(this);
  }

  onAddInviteesButtonClick = (event) => {
    const {dispatch, inviteesRaw} = this.props;
    const parsedAddresses = emailAddresses.parseAddressList(inviteesRaw);

    event.preventDefault();
    // clear the inviteesRaw form component:
    dispatch(change('welcomeWizard', 'inviteesRaw', ''));
    if (!parsedAddresses) {
      return;
    }
    parsedAddresses.forEach(email => {
      dispatch(arrayPush('welcomeWizard', 'invitees', {
        address: email.address,
        name: email.name,
        label: email.name ? `"${email.name}" <${email.address}>` : email.address
      }));
    });
  }

  render() {
    const {handleSubmit, invitees, inviteesRaw, teamName} = this.props;

    const invitesFieldHasError = false; // TODO: wire this up for real
    const helpText = invitesFieldHasError ?
      // eslint-disable-next-line max-len
      <span>Oops! Please make sure email addresses are valid <br />and separated by a single comma.</span> :
      <span>You can paste multiple emails separated by a comma.<br />&nbsp;</span>;

    return (
      <WelcomeLayout>
        <WelcomeHeader heading={<span>Invite your team.</span>} />
        <WelcomeContent>
          <ProgressDots
            numDots={2}
            numCompleted={1}
            currentDot={2}
          />
          <div>{/* Div for that flexy flex */}
            <Type align="center" italic scale="s6">
              Sounds like a great team!
            </Type>
            <WelcomeHeading copy={<span>Let’s invite some folks to the <b>{teamName}</b> team.</span>} />
            <HotKeys handlers={{ keyEnter: this.onAddInviteesButtonClick}}>
              <Field
                autoFocus
                buttonDisabled={!inviteesRaw}
                buttonIcon="check-circle"
                hasButton
                hasErrorText={invitesFieldHasError}
                hasHelpText
                helpText={helpText}
                isLarger
                isWider
                name="inviteesRaw"
                type="text"
                onButtonClick={this.onAddInviteesButtonClick}
                placeholder="b.bunny@acme.co, d.duck@acme.co, e.fudd@acme.co"
              />
              <form onSubmit={handleSubmit(this.props.onSubmit)}>
                <LabeledFieldArray
                  labelGetter={(idx) => invitees[idx].label}
                  labelHeader="Invitee"
                  labelSource="invitees"
                  nestedFieldHeader="This Week's Priority"
                  nestedFieldName="outcome"
                />
              </form>
            </HotKeys>
          </div>
        </WelcomeContent>
      </WelcomeLayout>
    );
  }
}
