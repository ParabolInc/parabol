import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {formValueSelector} from 'redux-form';
import {HotKeys} from 'react-hotkeys';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';

import {
  Step1PreferredName,
  Step2TeamName,
  Step3InviteTeam
} from '../../components/WelcomeWizardForms';

const keyMap = {
  keyEnter: 'enter',
  seqHelp: 'shift+/' // TODO: presently unused
};

const selector = formValueSelector('welcomeWizard');

const mapStateToProps = state => ({
  invitees: selector(state, 'invitees'),
  inviteesRaw: selector(state, 'inviteesRaw'),
  preferredName: selector(state, 'preferredName'),
  teamName: selector(state, 'teamName'),
  authToken: state.authToken,
  welcome: state.welcome
});

const WelcomeContainer = props => {
  const {page} = props.welcome;
  return (
    <HotKeys focused attach={window} keyMap={keyMap}>
      {page === 1 && <Step1PreferredName {...props}/>}
      {page === 2 && <Step2TeamName {...props}/>}
      {page === 3 && <Step3InviteTeam {...props}/>}
    </HotKeys>
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
