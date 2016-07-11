import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {formValueSelector} from 'redux-form';
import {HotKeys} from 'react-hotkeys';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {authedOptions} from 'universal/redux/getAuthedUser';

import {mutationHandlers as Step2MutationHandlers} from '../../components/WelcomeWizardForms/Step2TeamName';

import {
  Step1PreferredName,
  Step2TeamName,
  Step3InviteTeam
} from '../../components/WelcomeWizardForms';

/*
 * Setup and extend requireAuth cashay mutation handlers:
 */
const cashayAuthQueryOpts = {
  component: 'WelcomeContainer',
  mutationHandlers: Object.assign(authedOptions.mutationHandlers,
    Step2MutationHandlers,
  ),
  localOnly: true
};

/*
 * Setup HotKeys events:
 */

const keyMap = {
  keyEnter: 'enter',
  seqHelp: 'shift+/' // TODO: presently unused
};

/*
 * Setup `redux-form` selector
 */

const selector = formValueSelector('welcomeWizard');

const mapStateToProps = (state) => ({
  authToken: state.authToken,
  invitees: selector(state, 'invitees'),
  inviteesRaw: selector(state, 'inviteesRaw'),
  preferredName: selector(state, 'preferredName'),
  teamName: selector(state, 'teamName'),
  /*
   * NOTE: cashay user object doesn't appear he, as we won't depend on
   *       rendering upon it.
   */
  welcome: state.welcome
});

const WelcomeContainer = (props) => {
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
  requireAuth(cashayAuthQueryOpts)(WelcomeContainer)
);
