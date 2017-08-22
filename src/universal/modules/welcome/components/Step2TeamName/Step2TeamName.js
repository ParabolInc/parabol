import {css} from 'aphrodite-local-styles/no-important';
import {cashay} from 'cashay';
import PropTypes from 'prop-types';
import React from 'react';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import shortid from 'shortid';
import InputField from 'universal/components/InputField/InputField';
import Type from 'universal/components/Type/Type';
import WelcomeHeading from 'universal/modules/welcome/components/WelcomeHeading/WelcomeHeading';
import WelcomeSubmitButton from 'universal/modules/welcome/components/WelcomeSubmitButton/WelcomeSubmitButton';
import {nextPage, setWelcomeTeam, updateCompleted} from 'universal/modules/welcome/ducks/welcomeDuck';
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
  const {error, dispatch, handleSubmit, preferredName, styles, submitting, teamName} = props;
  const onTeamNameSubmit = async (submissionData) => {
    const {data: {teamName: normalizedTeamName}} = step2Validation()(submissionData);
    const teamId = shortid.generate();
    const teamMemberId = shortid.generate();
    dispatch(setWelcomeTeam({teamId, teamMemberId}));
    const options = {
      variables: {
        newTeam: {
          id: teamId,
          name: normalizedTeamName
        }
      }
    };
    // createFirstTeam returns a new JWT with a new tms field
    const {data: {createFirstTeam: newToken}, error: cashayError} = await cashay.mutate('createFirstTeam', options);
    if (cashayError) throw new SubmissionError(cashayError);
    dispatch(updateCompleted(2));
    dispatch(nextPage());
    dispatch(setAuthToken(newToken));
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

export default reduxForm(formOptions)(
  withStyles(styleThunk)(Step2TeamName)
);
