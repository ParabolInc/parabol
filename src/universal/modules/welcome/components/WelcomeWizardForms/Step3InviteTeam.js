import React, {PropTypes, Component} from 'react';
import {reduxForm, change} from 'redux-form';
import {HotKeys} from 'react-hotkeys';
import emailAddresses from 'email-addresses';
import Field from 'universal/components/Field/Field';
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
    inviteesRaw: PropTypes.string,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    onSubmit: PropTypes.func,
    welcome: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.onAddInviteesButtonClick = this.onAddInviteesButtonClick.bind(this);
    this.state = {
      // maps emailAddress -> fullName
      parsedEmailsMap: {}
    };
  }

  onAddInviteesButtonClick = (event) => {
    const {dispatch, inviteesRaw} = this.props;
    const parsedEmailsMap = Object.assign({}, this.state.parsedEmailsMap);
    event.preventDefault();
    emailAddresses.parseAddressList(inviteesRaw).forEach(email => {
      parsedEmailsMap[email.address] = email.name;
    });
    this.setState({parsedEmailsMap});
    // clear the inviteesRaw form component:
    dispatch(change('welcomeWizard', 'inviteesRaw', ''));
  }

  render() {
    const {handleSubmit, inviteesRaw, pristine, submitting, welcome} = this.props;

    const invitesFieldHasError = false; // TODO: wire this up for real
    const helpText = invitesFieldHasError ?
      // eslint-disable-next-line max-len
      <span>Oops! Please make sure email addresses are valid <br />and separated by a single comma.</span> :
      <span>You can paste multiple emails separated by a comma.<br />&nbsp;</span>;

    console.log(this.state.parsedEmailsMap);

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
            <WelcomeHeading copy={<span>Let’s invite some folks to the <b>{welcome.teamName}</b> team.</span>} />
            <br/ >
            <br/ >
            <b>THIS IS BROKEN UNTIL WE DO PARSING:</b>
            <br />
            <br />
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
            </HotKeys>
            {/*
            <form onSubmit={handleSubmit(this.props.onSubmit)}>
              <Field
                name="inviteeEmail"
                component="input"
                placeholder="Email address"
                type="text"
                autoFocus
              />
              <Field
                name="inviteeTask"
                component="input"
                placeholder="What is their priority today?"
                type="text"
              />
              <button type="submit" disabled={pristine || submitting}>Next</button>
            </form>
            */}
          </div>
        </WelcomeContent>
      </WelcomeLayout>
    );
  }
}
