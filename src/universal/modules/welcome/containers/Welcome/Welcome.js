import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {formValueSelector} from 'redux-form';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {goToPage} from 'universal/modules/welcome/ducks/welcomeDuck';
import ProgressDots from 'universal/modules/welcome/components/ProgressDots/ProgressDots';
import WelcomeContent from 'universal/modules/welcome/components/WelcomeContent/WelcomeContent';
import WelcomeHeader from 'universal/modules/welcome/components/WelcomeHeader/WelcomeHeader';
import WelcomeLayout from 'universal/modules/welcome/components/WelcomeLayout/WelcomeLayout';

import {
  Step1PreferredName,
  Step2TeamName,
  Step3InviteTeam
} from '../../components/WelcomeWizardForms';

const selector = formValueSelector('welcomeWizard');

const mapStateToProps = (state) => ({
  invitees: selector(state, 'invitees'),
  inviteesRaw: selector(state, 'inviteesRaw'),
  preferredName: selector(state, 'preferredName'),
  teamName: selector(state, 'teamName'),
  authToken: state.authToken,
  welcome: state.welcome
});

const WelcomeContainer = (props) => {
  const {dispatch, welcome: {page, completed}} = props;
  const progressDotClickFactory = (dot) => (e) => {
    e.preventDefault();
    if (dot <= completed + 1) {
      dispatch(goToPage(dot));
    }
  };
  const headingText = page === 1 ? 'Hello!' : 'Invite your team';
  return (
    <WelcomeLayout>
      <WelcomeHeader heading={<span>{headingText}</span>}/>
      <WelcomeContent>
        <ProgressDots
          numDots={3}
          numCompleted={completed}
          currentDot={page}
          clickFactory={progressDotClickFactory}
        />
        {page === 1 && <Step1PreferredName completed={completed} {...props}/>}
        {page === 2 && <Step2TeamName completed={completed} {...props}/>}
        {page === 3 && <Step3InviteTeam {...props}/>}
      </WelcomeContent>
    </WelcomeLayout>
  );
};

WelcomeContainer.propTypes = {
  dispatch: PropTypes.func,
  invitees: PropTypes.array,
  inviteesRaw: PropTypes.string,
  preferredName: PropTypes.string,
  teamName: PropTypes.string,
  welcome: PropTypes.shape({
    teamId: PropTypes.string,
    teamMemberId: PropTypes.string
  })
};

export default connect(mapStateToProps)(
  requireAuth(WelcomeContainer)
);
