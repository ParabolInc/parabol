import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {formValueSelector} from 'redux-form';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {goToPage} from 'universal/modules/welcome/ducks/welcomeDuck';
import Welcome from 'universal/modules/welcome/components/Welcome/Welcome';
import {withRouter} from 'react-router';

const selector = formValueSelector('welcomeWizard');
const rawSelector = formValueSelector('welcomeWizardRawInvitees');

const mapStateToProps = (state, props) => ({
  invitees: selector(state, 'invitees'),
  inviteesRaw: rawSelector(state, 'inviteesRaw'),
  // default to something nice
  preferredName: selector(state, 'preferredName') || (props.user && props.user.preferredName),
  teamName: selector(state, 'teamName'),
  tms: state.auth.obj.tms,
  welcome: state.welcome
});

const WelcomeContainer = (props) => {
  const {dispatch, invitees, inviteesRaw, preferredName, teamName, router, tms, welcome} = props;
  const {completed} = welcome;
  const progressDotClickFactory = (dot) => (e) => {
    e.preventDefault();
    if (dot <= completed + 1) {
      dispatch(goToPage(dot));
    }
  };
  if (tms && completed === 0) {
    router.push('/me');
    return null;
  }
  return (
    <Welcome
      invitees={invitees}
      inviteesRaw={inviteesRaw}
      preferredName={preferredName}
      teamName={teamName}
      tms={tms}
      welcome={welcome}
      progressDotClickFactory={progressDotClickFactory}
      title="Welcome"
    />
  );
};

WelcomeContainer.propTypes = {
  dispatch: PropTypes.func,
  invitees: PropTypes.array,
  inviteesRaw: PropTypes.string,
  preferredName: PropTypes.string,
  router: PropTypes.object,
  teamName: PropTypes.string,
  tms: PropTypes.array,
  welcome: PropTypes.shape({
    existingInvites: PropTypes.array,
    teamId: PropTypes.string,
    teamMemberId: PropTypes.string
  })
};

export default connect(mapStateToProps)(
  requireAuth(
    withRouter(WelcomeContainer)
  )
);
