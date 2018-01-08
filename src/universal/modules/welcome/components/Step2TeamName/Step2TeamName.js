import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import InputField from 'universal/components/InputField/InputField';
import Type from 'universal/components/Type/Type';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import WelcomeHeading from 'universal/modules/welcome/components/WelcomeHeading/WelcomeHeading';
import WelcomeSubmitButton from 'universal/modules/welcome/components/WelcomeSubmitButton/WelcomeSubmitButton';
import {nextPage, setWelcomeTeam, updateCompleted} from 'universal/modules/welcome/ducks/welcomeDuck';
import CreateFirstTeamMutation from 'universal/mutations/CreateFirstTeamMutation';
import {setAuthToken} from 'universal/redux/authDuck';
import formError from 'universal/styles/helpers/formError';
import withStyles from 'universal/styles/withStyles';
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder';
import step2Validation from './step2Validation';

const validate = (values) => {
  const welcomeSchema = step2Validation();
  return welcomeSchema(values).errors;
};

const Step2TeamName = (props) => {
  const {atmosphere, error, dispatch, handleSubmit, preferredName, styles, submitting, teamName} = props;
  const onTeamNameSubmit = async (submissionData) => {
    const {data: {teamName: normalizedTeamName}} = step2Validation()(submissionData);
    const onError = (err) => {
      throw new SubmissionError(err);
    };
    const onCompleted = (res) => {
      const {createFirstTeam: {jwt: newToken, team: {id: teamId}, teamLead: {id: teamMemberId}}} = res;
      dispatch(setWelcomeTeam({teamId, teamMemberId}));
      dispatch(updateCompleted(2));
      dispatch(nextPage());
      dispatch(setAuthToken(newToken));
    };
    const newTeam = {name: normalizedTeamName};
    CreateFirstTeamMutation(atmosphere, newTeam, onError, onCompleted);
  };
  return (
    <div style={{width: '100%'}}>
      <Type align="center" italic scale="s6">
        Nice to meet you, {preferredName}!
      </Type>
      <WelcomeHeading copy={<span>Please type in your team name:</span>} />
      {error && <div className={css(styles.error)}>{error}</div>}
      <form className={css(styles.formBlock)} onSubmit={handleSubmit(onTeamNameSubmit)}>
        <Field
          autoFocus
          component={InputField}
          isLarger
          name="teamName"
          placeholder={randomPlaceholderTheme.teamName}
          shortcutHint="Press enter"
          shortcutDisabled={!teamName}
          type="text"
          underline
        />
        <WelcomeSubmitButton disabled={submitting || !teamName} />
      </form>
    </div>
  );
};

Step2TeamName.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  error: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  onSubmit: PropTypes.func,
  preferredName: PropTypes.string.isRequired,
  styles: PropTypes.object,
  submitting: PropTypes.bool,
  teamName: PropTypes.string,
  user: PropTypes.object,
  completed: PropTypes.number
};

const styleThunk = () => ({
  error: {
    ...formError
  },

  formBlock: {
    alignItems: 'baseline',
    display: 'flex',
    margin: '0 auto',
    maxWidth: '30rem',
    paddingLeft: '2.5rem',
    width: '100%'
  }
});


const formOptions = {
  form: 'welcomeWizard',
  destroyOnUnmount: false,
  validate
};

export default withAtmosphere(
  reduxForm(formOptions)(
    withStyles(styleThunk)(Step2TeamName)
  )
);
