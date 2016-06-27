import React, {PropTypes} from 'react';
import {reduxForm, Field} from 'redux-form';
import Type from 'universal/components/Type/Type';
import ProgressDots from '../ProgressDots/ProgressDots';
import WelcomeContent from '../WelcomeContent/WelcomeContent';
import WelcomeHeader from '../WelcomeHeader/WelcomeHeader';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import WelcomeLayout from '../WelcomeLayout/WelcomeLayout';

const WelcomeTeam = props => {
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
            Nice to meet you, {welcome.preferredName}!
          </Type>
          <WelcomeHeading copy={<span>Please type in your team name:</span>} />
          <form onSubmit={handleSubmit(props.onSubmit)}>
            <Field
              name="teamName"
              component="input"
              placeholder="The Beatles"
              type="text"
              autoFocus
            />
            <button type="submit" disabled={pristine || submitting}>Next</button>
          </form>
        </div>
      </WelcomeContent>
    </WelcomeLayout>
  );
};

WelcomeTeam.propTypes = {
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func,
  welcome: PropTypes.object
};

export default reduxForm({
  form: 'welcomeTeam'  // a unique identifier for this form
})(WelcomeTeam);
