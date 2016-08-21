import React, {PropTypes} from 'react';
import {reduxForm} from 'redux-form';
import Field from 'universal/components/Field/Field';
import Type from 'universal/components/Type/Type';
import ProgressDots from '../ProgressDots/ProgressDots';
import WelcomeContent from '../WelcomeContent/WelcomeContent';
import WelcomeHeader from '../WelcomeHeader/WelcomeHeader';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import WelcomeLayout from '../WelcomeLayout/WelcomeLayout';
import {nextPage, previousPage, updateCompleted, setWelcomeTeam} from 'universal/modules/welcome/ducks/welcomeDuck';
import shortid from 'shortid';
import {cashay} from 'cashay';
import {setAuthToken} from 'universal/redux/authDuck';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';

const Step2TeamName = (props) => {
  const {dispatch, handleSubmit, preferredName, teamName, completed} = props;
  const onTeamNameSubmit = data => {
    const myTeamName = data.teamName;
    const teamId = shortid.generate();
    const teamMemberId = shortid.generate();
    dispatch(setWelcomeTeam({teamId, teamMemberId}));
    const createTeamOptions = {
      variables: {
        newTeam: {
          id: teamId,
          name: myTeamName
        }
      }
    };
    // createTeam returns a new JWT with a new tms field
    cashay.mutate('createTeam', createTeamOptions).then((res) => {
      const authToken = res.data.createTeam;
      dispatch(setAuthToken(authToken));
      cashay.create({httpTransport: new ActionHTTPTransport(authToken)});
    });
    dispatch(updateCompleted(3));
    dispatch(nextPage());
  };
  const progressDotClick = (dot) => {
    if (dot === 1) {
      dispatch(previousPage());
    } else if (dot === 3) {
      if (teamName) {
        dispatch(nextPage());
      }
    }
  };
  return (
    <WelcomeLayout>
      <WelcomeHeader heading={<span>Invite your team.</span>} />
      <WelcomeContent>
        <ProgressDots
          numDots={3}
          numCompleted={completed}
          currentDot={2}
          onClick={progressDotClick}
        />
        <div>{/* Div for that flexy flex */}
          <Type align="center" italic scale="s6">
            Nice to meet you, {preferredName}!
          </Type>
          <WelcomeHeading copy={<span>Please type in your team name:</span>} />
          <form onSubmit={handleSubmit(onTeamNameSubmit)}>
            <Field
              autoFocus
              buttonDisabled={!teamName}
              buttonIcon="check-circle"
              hasButton
              hasShortcutHint
              name="teamName"
              type="text"
              placeholder="The Beatles"
              shortcutHint="Press enter"
            />
          </form>
        </div>
      </WelcomeContent>
    </WelcomeLayout>
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

export default reduxForm({
  form: 'welcomeWizard',
  destroyOnUnmount: false
  // TODO: add validations
})(Step2TeamName);
