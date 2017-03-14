import React, {Component, PropTypes} from 'react';
import {Field, reduxForm, initialize, SubmissionError} from 'redux-form';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import InputField from 'universal/components/InputField/InputField';
import {cashay} from 'cashay';
import {nextPage, updateCompleted} from 'universal/modules/welcome/ducks/welcomeDuck';
import {segmentEventTrack} from 'universal/redux/segmentActions';
import step1Validation from './step1Validation';
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder';
import shouldValidate from 'universal/validation/shouldValidate';
import formError from 'universal/styles/helpers/formError';
import WelcomeSubmitButton from '../WelcomeSubmitButton/WelcomeSubmitButton';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';

const validate = (values) => {
  const welcomeSchema = step1Validation();
  return welcomeSchema(values).errors;
};

class Step1PreferredName extends Component {
  static propTypes = {
    error: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func,
    placeholderTheme: PropTypes.object,
    preferredName: PropTypes.string,
    onSubmit: PropTypes.func,
    styles: PropTypes.object,
    submitting: PropTypes.bool,
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

  onPreferredNameSubmit = async (submissionData) => {
    const {dispatch, user} = this.props;
    const {data: {preferredName}} = step1Validation()(submissionData);
    const options = {
      variables: {
        updatedUser: {
          id: user.id,
          preferredName
        }
      }
    };
    const {error} = await cashay.mutate('updateUserProfile', options);
    if (error) throw new SubmissionError(error);
    dispatch(updateCompleted(1));
    dispatch(nextPage());
    dispatch(segmentEventTrack('Welcome Step1 Completed', {preferredName}));
  };

  render() {
    const {error, handleSubmit, preferredName, styles, submitting} = this.props;
    return (
      <div>
        <WelcomeHeading copy={<span>Please type in your name:</span>} />
        {error && <div className={css(styles.error)}>{error}</div>}
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
            underline
          />
          <WelcomeSubmitButton disabled={submitting || !preferredName} />
        </form>
      </div>
    );
  }
}

const styleThunk = () => ({
  error: {
    ...formError
  },
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
