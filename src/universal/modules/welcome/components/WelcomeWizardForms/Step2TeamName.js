import React, {PropTypes} from 'react';
import {reduxForm} from 'redux-form';
import getAuth from 'universal/redux/getAuth';
import Field from 'universal/components/Field/Field';
import Type from 'universal/components/Type/Type';
import ProgressDots from '../ProgressDots/ProgressDots';
import WelcomeContent from '../WelcomeContent/WelcomeContent';
import WelcomeHeader from '../WelcomeHeader/WelcomeHeader';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import WelcomeLayout from '../WelcomeLayout/WelcomeLayout';
import {nextPage, setWelcomeTeam} from 'universal/modules/welcome/ducks/welcomeDuck';
import shortid from 'shortid';
import {cashay} from 'cashay';
import getAuthedUser from 'universal/redux/getAuthedUser';

const Step2TeamName = props => {
  const {dispatch, handleSubmit, preferredName, teamName} = props;
  const onTeamNameSubmit = data => {
    const myTeamName = data.teamName;
    const teamId = shortid.generate();
    const teamMemberId = shortid.generate();
    const user = getAuthedUser();
    dispatch(setWelcomeTeam({teamId, teamMemberId}));
    const createTeamOptions = {
      variables: {
        newTeam: {
          id: teamId,
          name: myTeamName,
          leader: {
            id: teamMemberId,
            teamId,
            cachedUserId: user.id,
            isActive: true,
            isLead: true,
            isFacilitator: true
          }
        }
      }
    };
    cashay.mutate('createTeam', createTeamOptions);
    dispatch(nextPage());
  };
  return (
    <WelcomeLayout>
      <WelcomeHeader heading={<span>Invite your team.</span>} />
      <WelcomeContent>
        <ProgressDots
          numDots={2}
          numCompleted={1}
          currentDot={2}
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
  teamName: PropTypes.string
};

export default reduxForm({
  form: 'welcomeWizard',
  destroyOnUnmount: false
  // TODO: add validations
})(Step2TeamName);
