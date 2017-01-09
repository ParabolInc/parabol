import React, {Component, PropTypes} from 'react';
import {Field, reduxForm, initialize} from 'redux-form';
import InputField from 'universal/components/InputField/InputField';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import {cashay} from 'cashay';
import {nextPage, updateCompleted} from 'universal/modules/welcome/ducks/welcomeDuck';
import {segmentEventTrack} from 'universal/redux/segmentActions';
import makeUpdatedUserSchema from 'universal/validation/makeUpdatedUserSchema';
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder';
import shouldValidate from 'universal/validation/shouldValidate';

const validate = (values) => {
  const welcomeSchema = makeUpdatedUserSchema();
  return welcomeSchema(values).errors;
};

const reduxFormOptions = {
  form: 'welcomeWizard',
  destroyOnUnmount: false,
  shouldValidate,
  validate
};

@reduxForm(reduxFormOptions)
export default class Step1PreferredName extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func,
    placeholderTheme: PropTypes.object,
    preferredName: PropTypes.string,
    onSubmit: PropTypes.func,
    user: PropTypes.object,
    completed: PropTypes.number
  };

  componentWillMount() {
    const {dispatch, user: {preferredName}} = this.props;
    dispatch(segmentEventTrack('Welcome Step1 Reached'));
    return dispatch(initialize('welcomeWizard', {preferredName}));
  }

  onPreferredNameSubmit = (submissionData) => {
    const {dispatch, user} = this.props;
    const newPreferredName = submissionData.preferredName.trim();
    const options = {
      variables: {
        updatedUser: {
          id: user.id,
          preferredName: newPreferredName
        }
      }
    };
    cashay.mutate('updateUserProfile', options);
    dispatch(segmentEventTrack('Welcome Step1 Completed',
      { preferredName: newPreferredName }
    ));
    dispatch(updateCompleted(1));
    dispatch(nextPage());
  };

  render() {
    const {handleSubmit, preferredName} = this.props;
    return (
      <div>{/* Div for that flexy flex */}
        <WelcomeHeading copy={<span>Please type in your name:</span>}/>
        <form onSubmit={handleSubmit(this.onPreferredNameSubmit)}>
          <Field
            autoFocus
            buttonDisabled={!preferredName}
            buttonIcon="check-circle"
            component={InputField}
            hasButton
            isLarger
            name="preferredName"
            placeholder={randomPlaceholderTheme.preferredName}
            shortcutHint="Press enter"
            type="text"
          />
        </form>
      </div>
    );
  }
}
