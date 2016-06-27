import React, {PropTypes} from 'react';
import {reduxForm, Field} from 'redux-form';
import ProgressDots from '../ProgressDots/ProgressDots';
import WelcomeContent from '../WelcomeContent/WelcomeContent';
import WelcomeHeader from '../WelcomeHeader/WelcomeHeader';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import WelcomeLayout from '../WelcomeLayout/WelcomeLayout';

const WelcomePreferredName = props => {
  const {handleSubmit, pristine, submitting} = props;
  return (
    <WelcomeLayout>
      <WelcomeHeader heading={<span>Hello!</span>} />
      <WelcomeContent>
        <ProgressDots
          numDots={2}
          numCompleted={0}
          currentDot={1}
        />
        <div>{/* Div for that flexy flex */}
          <WelcomeHeading copy={<span>Please type in your name:</span>} />
          <form onSubmit={handleSubmit(props.onSubmit)}>
            <Field
              name="preferredName"
              component="input"
              placeholder="Albert Einstein"
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

WelcomePreferredName.propTypes = {
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func
};

export default reduxForm({
  form: 'welcomePreferredName'  // a unique identifier for this form
})(WelcomePreferredName);
