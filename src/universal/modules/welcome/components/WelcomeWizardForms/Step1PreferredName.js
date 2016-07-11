import React, {PropTypes} from 'react';
import {reduxForm} from 'redux-form';
import Field from 'universal/components/Field/Field';
import ProgressDots from '../ProgressDots/ProgressDots';
import WelcomeContent from '../WelcomeContent/WelcomeContent';
import WelcomeHeader from '../WelcomeHeader/WelcomeHeader';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import WelcomeLayout from '../WelcomeLayout/WelcomeLayout';
import {cashay} from 'cashay';
import {nextPage} from 'universal/modules/welcome/ducks/welcomeDuck';

const Step1PreferredName = (props) => {
  const {handleSubmit, preferredName, dispatch, user} = props;
  const onPreferredNameSubmit = submissionData => {
    const {preferredName: newPrefferedName} = submissionData;
    const options = {
      component: 'WelcomeContainer',
      variables: {
        updatedProfile: {
          id: user.id,
          preferredName: newPrefferedName
        }
      }
    };
    cashay.mutate('updateUserProfile', options);
    dispatch(nextPage());
  };
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
  user: PropTypes.object
};

export default reduxForm({
  form: 'welcomeWizard',
  destroyOnUnmount: false
  // TODO: add validations
})(Step1PreferredName);
