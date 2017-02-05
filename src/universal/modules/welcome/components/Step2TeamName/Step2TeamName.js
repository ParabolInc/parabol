import React, {PropTypes} from 'react';
import InputField from 'universal/components/InputField/InputField';
import {Field, reduxForm} from 'redux-form';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Type from 'universal/components/Type/Type';
import WelcomeHeading from 'universal/modules/welcome/components/WelcomeHeading/WelcomeHeading';
import {nextPage, updateCompleted, setWelcomeTeam} from 'universal/modules/welcome/ducks/welcomeDuck';
import shortid from 'shortid';
import {cashay} from 'cashay';
import {setAuthToken} from 'universal/redux/authDuck';
import {segmentEventTrack} from 'universal/redux/segmentActions';
import makeStep2Schema from 'universal/validation/makeStep2Schema';
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder';
import WelcomeSubmitButton from 'universal/modules/welcome/components/WelcomeSubmitButton/WelcomeSubmitButton';

const validate = (values) => {
  const welcomeSchema = makeStep2Schema('teamName');
  return welcomeSchema(values).errors;
};

const Step2TeamName = (props) => {
  const {dispatch, handleSubmit, preferredName, styles, teamName} = props;
  const onTeamNameSubmit = (data) => {
    const teamId = shortid.generate();
    const teamMemberId = shortid.generate();
    dispatch(setWelcomeTeam({teamId, teamMemberId}));
    const options = {
      variables: {
        newTeam: {
          id: teamId,
          name: data.teamName.trim()
        }
      }
    };
    // createFirstTeam returns a new JWT with a new tms field
    cashay.mutate('createFirstTeam', options).then((res) => {
      dispatch(setAuthToken(res.data.createFirstTeam));
      dispatch(segmentEventTrack('Welcome Step2 Completed'));
      dispatch(updateCompleted(2));
      dispatch(nextPage());
    });
  };
  return (
    <div>
      <Type align="center" italic scale="s6">
        Nice to meet you, {preferredName}!
      </Type>
      <WelcomeHeading copy={<span>Please type in your team name:</span>}/>
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
        />
        <WelcomeSubmitButton disabled={!teamName}/>
      </form>
    </div>
  );
};

Step2TeamName.propTypes = {
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  onSubmit: PropTypes.func,
  preferredName: PropTypes.string.isRequired,
  teamName: PropTypes.string,
  user: PropTypes.object,
  completed: PropTypes.number
};

const styleThunk = () => ({
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
