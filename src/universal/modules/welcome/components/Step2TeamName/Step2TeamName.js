import React, {PropTypes} from 'react';
import InputField from 'universal/components/InputField/InputField';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Type from 'universal/components/Type/Type';
import WelcomeHeading from 'universal/modules/welcome/components/WelcomeHeading/WelcomeHeading';
import {nextPage, updateCompleted, setWelcomeTeam} from 'universal/modules/welcome/ducks/welcomeDuck';
import shortid from 'shortid';
import {cashay} from 'cashay';
import {setAuthToken} from 'universal/redux/authDuck';
import {segmentEventTrack} from 'universal/redux/segmentActions';
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder';
import WelcomeSubmitButton from 'universal/modules/welcome/components/WelcomeSubmitButton/WelcomeSubmitButton';
import step2Validation from './step2Validation';
import formError from 'universal/styles/helpers/formError';

const validate = (values) => {
  const welcomeSchema = step2Validation();
  return welcomeSchema(values).errors;
};

const Step2TeamName = (props) => {
  const {error, dispatch, handleSubmit, preferredName, styles, submitting, teamName} = props;
  const onTeamNameSubmit = async(submissionData) => {
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
    dispatch(segmentEventTrack('Welcome Step2 Completed'));
  };
  return (
    <div>
      <Type align="center" italic scale="s6">
        Nice to meet you, {preferredName}!
      </Type>
      <WelcomeHeading copy={<span>Please type in your team name:</span>}/>
      <form className={css(styles.formBlock)} onSubmit={handleSubmit(onTeamNameSubmit)}>
        {error && <div className={css(styles.error)}>{error}</div>}
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
        <WelcomeSubmitButton disabled={submitting || !teamName}/>
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
    display: 'flex'
  },
});


const formOptions = {
  form: 'welcomeWizard',
  destroyOnUnmount: false,
  validate
};

export default reduxForm(formOptions)(
  withStyles(styleThunk)(Step2TeamName)
);
