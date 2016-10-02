import React, {Component, PropTypes} from 'react';
import {Field, reduxForm, initialize} from 'redux-form';
import InputField from 'universal/components/InputField/InputField';
import ProgressDots from '../ProgressDots/ProgressDots';
import WelcomeContent from '../WelcomeContent/WelcomeContent';
import WelcomeHeader from '../WelcomeHeader/WelcomeHeader';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import WelcomeLayout from '../WelcomeLayout/WelcomeLayout';
import {cashay} from 'cashay';
import {nextPage, goToPage, updateCompleted} from 'universal/modules/welcome/ducks/welcomeDuck';

const reduxFormOptions = {
  form: 'welcomeWizard',
  destroyOnUnmount: false
  // TODO: add validations
};

@reduxForm(reduxFormOptions)
export default class Step1PreferredName extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func,
    preferredName: PropTypes.string,
    onSubmit: PropTypes.func,
    user: PropTypes.object,
    completed: PropTypes.number
  };

  componentWillMount() {
    const {dispatch, user: {nickname}} = this.props;
    return dispatch(initialize('welcomeWizard', {preferredName: nickname}));
  }

  onPreferredNameSubmit = (submissionData) => {
    const {dispatch, user, completed} = this.props;
    const {preferredName: newPrefferedName} = submissionData;
    const options = {
      variables: {
        updatedUser: {
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

  progressDotClick = (dot) => {
    const {completed, dispatch, preferredName} = this.props;
    if (dot === 2 && preferredName) {
      dispatch(goToPage(2));
    } else if (dot === 3 && completed === 3) {
      dispatch(goToPage(3));
    }
  };

  render() {
    const {handleSubmit, preferredName, completed} = this.props;
    return (
      <WelcomeLayout>
        <WelcomeHeader heading={<span>Hello!</span>}/>
        <WelcomeContent>
          <ProgressDots
            numDots={3}
            numCompleted={completed}
            currentDot={1}
            onClick={this.progressDotClick}
          />
          <div>{/* Div for that flexy flex */}
            <WelcomeHeading copy={<span>Please type in your name:</span>}/>
            <form onSubmit={handleSubmit(this.onPreferredNameSubmit)}>
              <Field
                autoFocus
                buttonDisabled={!preferredName}
                buttonIcon="check-circle"
                component={InputField}
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
  }
}
