import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import {Field, initialize, reduxForm, SubmissionError} from 'redux-form';
import InputField from 'universal/components/InputField/InputField';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {nextPage, updateCompleted} from 'universal/modules/welcome/ducks/welcomeDuck';
import SendClientSegmentEventMutation from 'universal/mutations/SendClientSegmentEventMutation';
import UpdateUserProfileMutation from 'universal/mutations/UpdateUserProfileMutation';
import formError from 'universal/styles/helpers/formError';
import withStyles from 'universal/styles/withStyles';
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder';
import shouldValidate from 'universal/validation/shouldValidate';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import WelcomeSubmitButton from '../WelcomeSubmitButton/WelcomeSubmitButton';
import step1Validation from './step1Validation';

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
    viewer: PropTypes.object.isRequired,
    completed: PropTypes.number
  };

  componentWillMount() {
    const {atmosphere, dispatch, viewer: {preferredName}} = this.props;
    SendClientSegmentEventMutation(atmosphere, 'Welcome Step1 Reached');
    if (preferredName) {
      dispatch(initialize('welcomeWizard', {preferredName}));
    }
  }

  componentWillReceiveProps(nextProps) {
    const {dispatch, viewer: {preferredName}} = nextProps;
    if (preferredName && !this.props.viewer.preferredName) {
      dispatch(initialize('welcomeWizard', {preferredName}));
    }
  }

  onPreferredNameSubmit = async (submissionData) => {
    const {atmosphere, dispatch} = this.props;
    const {data: {preferredName}} = step1Validation()(submissionData);
    const updatedUser = {preferredName};
    const onError = (err) => {
      throw new SubmissionError(err);
    };
    const onCompleted = () => {
      dispatch(updateCompleted(1));
      dispatch(nextPage());
      SendClientSegmentEventMutation(atmosphere, 'Welcome Step1 Completed');
    };
    UpdateUserProfileMutation(atmosphere, updatedUser, onError, onCompleted);
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

export default createFragmentContainer(
  withAtmosphere(
    withStyles(styleThunk)(
      reduxForm(reduxFormOptions)(Step1PreferredName)
    )
  ),
  graphql`
    fragment Step1PreferredName_viewer on User {
      preferredName
    }
  `
);
