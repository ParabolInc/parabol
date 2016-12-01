import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {formValueSelector} from 'redux-form';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {goToPage} from 'universal/modules/welcome/ducks/welcomeDuck';
import Welcome from 'universal/modules/welcome/components/Welcome/Welcome';

const selector = formValueSelector('welcomeWizard');
const rawSelector = formValueSelector('welcomeWizardRawInvitees');

const mapStateToProps = (state) => ({
  invitees: selector(state, 'invitees'),
  inviteesRaw: rawSelector(state, 'inviteesRaw'),
  preferredName: selector(state, 'preferredName'),
  teamName: selector(state, 'teamName'),
  authToken: state.authToken,
  welcome: state.welcome
});

const WelcomeContainer = (props) => {
  const {dispatch, welcome: {completed}} = props;
  const progressDotClickFactory = (dot) => (e) => {
    e.preventDefault();
    if (dot <= completed + 1) {
      dispatch(goToPage(dot));
    }
  };
  return (
    <Welcome
      {...props}
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
  teamName: PropTypes.string,
  welcome: PropTypes.shape({
    existingInvites: PropTypes.array,
    teamId: PropTypes.string,
    teamMemberId: PropTypes.string
  })
};

export default connect(mapStateToProps)(
  requireAuth(WelcomeContainer)
);
