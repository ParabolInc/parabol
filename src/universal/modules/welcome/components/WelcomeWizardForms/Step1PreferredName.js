import React, {PropTypes} from 'react';
import {reduxForm} from 'redux-form';
import Field from 'universal/components/Field/Field';
import ProgressDots from '../ProgressDots/ProgressDots';
import WelcomeContent from '../WelcomeContent/WelcomeContent';
import WelcomeHeader from '../WelcomeHeader/WelcomeHeader';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import WelcomeLayout from '../WelcomeLayout/WelcomeLayout';
import {cashay} from 'cashay';
import {nextPage, goToPage, updateCompleted} from 'universal/modules/welcome/ducks/welcomeDuck';

const Step1PreferredName = (props) => {
  const {handleSubmit, preferredName, dispatch, user, completed} = props;
  const onPreferredNameSubmit = submissionData => {
    const {preferredName: newPrefferedName} = submissionData;
    const options = {
      variables: {
        updatedProfile: {
          id: user.id,
          preferredName: newPrefferedName
        }
      }
    };
    cashay.mutate('updateUserProfile', options);
    if (completed !== 3) {
      dispatch(updateCompleted(2));
    }
    dispatch(nextPage());
  };
  const progressDotClick = (dot) => {
    if (dot === 2 && preferredName) {
      dispatch(goToPage(2));
    } else if (dot === 3 && completed === 3) {
      dispatch(goToPage(3));
    }
  };
  return (
    <WelcomeLayout>
      <WelcomeHeader heading={<span>Hello!</span>} />
      <WelcomeContent>
        <ProgressDots
          numDots={3}
          numCompleted={completed}
          currentDot={1}
          onClick={progressDotClick}
        />
        <div>{/* Div for that flexy flex */}
          <WelcomeHeading copy={<span>Please type in your name:</span>} />
          <form onSubmit={handleSubmit(onPreferredNameSubmit)}>
            <Field
              autoFocus
              buttonDisabled={!preferredName}
              buttonIcon="check-circle"
              hasButton
              hasShortcutHint
              isLarger
              name="preferredName"
              placeholder="Albert Einstein"
              shortcutHint="Press enter"
              type="text"
            />
          </form>
        </div>
      </WelcomeContent>
    </WelcomeLayout>
  );
};

Step1PreferredName.propTypes = {
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  preferredName: PropTypes.string,
  onSubmit: PropTypes.func,
  user: PropTypes.object,
  completed: PropTypes.number
};

export default reduxForm({
  form: 'welcomeWizard',
  destroyOnUnmount: false
  // TODO: add validations
})(Step1PreferredName);
