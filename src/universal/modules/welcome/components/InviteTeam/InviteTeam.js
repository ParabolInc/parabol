import React, {PropTypes} from 'react';
import {reduxForm, Field} from 'redux-form';
import Type from 'universal/components/Type/Type';
import ProgressDots from '../ProgressDots/ProgressDots';
import WelcomeContent from '../WelcomeContent/WelcomeContent';
import WelcomeHeader from '../WelcomeHeader/WelcomeHeader';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import WelcomeLayout from '../WelcomeLayout/WelcomeLayout';

// TODO sync validation & parsing
// TODO async validation via mailgun on submit
const InviteTeam = props => {
  const {handleSubmit, pristine, submitting, welcome} = props;
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
          <form onSubmit={handleSubmit(props.onSubmit)}>
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
        </div>
      </WelcomeContent>
    </WelcomeLayout>
  );
};

InviteTeam.propTypes = {
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func,
  welcome: PropTypes.object
};

export default reduxForm({
  form: 'InviteTeam'  // a unique identifier for this form
})(InviteTeam);
