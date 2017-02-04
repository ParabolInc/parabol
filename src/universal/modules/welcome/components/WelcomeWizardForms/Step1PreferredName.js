import React, {Component, PropTypes} from 'react';
import {Field, reduxForm, initialize} from 'redux-form';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import InputField from 'universal/components/InputField/InputField';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import {cashay} from 'cashay';
import {nextPage, updateCompleted} from 'universal/modules/welcome/ducks/welcomeDuck';
import {segmentEventTrack} from 'universal/redux/segmentActions';
import makeUpdatedUserSchema from 'universal/validation/makeUpdatedUserSchema';
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder';
import shouldValidate from 'universal/validation/shouldValidate';
import WelcomeSubmitButton from 'universal/modules/welcome/components/WelcomeSubmitButton/WelcomeSubmitButton';

const validate = (values) => {
  const welcomeSchema = makeUpdatedUserSchema();
  return welcomeSchema(values).errors;
};

class Step1PreferredName extends Component {
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
    if (preferredName) {
      dispatch(initialize('welcomeWizard', {preferredName}));
    }
  }

  componentWillReceiveProps(nextProps) {
    const {dispatch, user: {preferredName}} = nextProps;
    if (preferredName && !this.props.user.preferredName) {
      dispatch(initialize('welcomeWizard', {preferredName}));
    }
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
      {preferredName: newPreferredName}
    ));
    dispatch(updateCompleted(1));
    dispatch(nextPage());
  };

  render() {
    const {handleSubmit, preferredName, styles} = this.props;
    return (
      <div>
        <WelcomeHeading copy={<span>Please type in your name:</span>}/>
        <form className={css(styles.formBlock)} onSubmit={handleSubmit(this.onPreferredNameSubmit)}>
          <Field
            autoFocus
            component={InputField}
            isLarger
            name="preferredName"
            placeholder={randomPlaceholderTheme.preferredName}
            shortcutDisabled={!preferredName}
            shortcutHint="Press enter"
            type="text"
          />
          <WelcomeSubmitButton disabled={!preferredName}/>
        </form>
      </div>
    );
  }
}

const styleThunk = () => ({
  formBlock: {
    alignItems: 'baseline',
    display: 'flex'
  }
});

const reduxFormOptions = {
  form: 'welcomeWizard',
  destroyOnUnmount: false,
  shouldValidate,
  validate
};

export default withStyles(styleThunk)(
  reduxForm(reduxFormOptions)(Step1PreferredName)
);
