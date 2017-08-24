import {css} from 'aphrodite-local-styles/no-important';
import {cashay} from 'cashay';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {Field, initialize, reduxForm, SubmissionError} from 'redux-form';
import InputField from 'universal/components/InputField/InputField';
import {nextPage, updateCompleted} from 'universal/modules/welcome/ducks/welcomeDuck';
import SendClientSegmentEventMutation from 'universal/mutations/SendClientSegmentEventMutation';
import formError from 'universal/styles/helpers/formError';
import withStyles from 'universal/styles/withStyles';
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder';
import shouldValidate from 'universal/validation/shouldValidate';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import WelcomeSubmitButton from '../WelcomeSubmitButton/WelcomeSubmitButton';
import step1Validation from './step1Validation';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

const validate = (values) => {
  const welcomeSchema = step1Validation();
  return welcomeSchema(values).errors;
};

class Step1PreferredName extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    error: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func,
    placeholderTheme: PropTypes.object,
    preferredName: PropTypes.string,
    onSubmit: PropTypes.func,
    styles: PropTypes.object,
    submitting: PropTypes.bool,
    user: PropTypes.object.isRequired,
    completed: PropTypes.number
  };

  componentWillMount() {
    const {atmosphere, dispatch, user: {preferredName}} = this.props;
    SendClientSegmentEventMutation(atmosphere, 'Welcome Step1 Reached');
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
    const {atmosphere, dispatch, user} = this.props;
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
    SendClientSegmentEventMutation(atmosphere, 'Welcome Step1 Completed');
  };

  render() {
    const {error, handleSubmit, preferredName, styles, submitting} = this.props;
    const copy = <span>{'What do you prefer your teammates to call you?'}</span>;
    return (
      <div style={{width: '100%'}}>
        <WelcomeHeading copy={copy} />
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
    display: 'flex',
    margin: '0 auto',
    maxWidth: '24rem',
    paddingLeft: '2.5rem',
    width: '100%'
  }
});

const reduxFormOptions = {
  form: 'welcomeWizard',
  destroyOnUnmount: false,
  shouldValidate,
  validate
};

export default withAtmosphere(
  withStyles(styleThunk)(
    reduxForm(reduxFormOptions)(Step1PreferredName)
  )
);
