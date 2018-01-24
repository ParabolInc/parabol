import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {formValueSelector} from 'redux-form';
import Welcome from 'universal/modules/welcome/components/Welcome/Welcome';
import welcomeReducer, {goToPage} from 'universal/modules/welcome/ducks/welcomeDuck';
import withReducer from '../../../../decorators/withReducer/withReducer';
import {createFragmentContainer} from 'react-relay';

const selector = formValueSelector('welcomeWizard');
const rawSelector = formValueSelector('welcomeWizardRawInvitees');

const mapStateToProps = (state) => ({
  invitees: selector(state, 'invitees'),
  inviteesRaw: rawSelector(state, 'inviteesRaw'),
  // default to something nice
  preferredName: selector(state, 'preferredName'),
  teamName: selector(state, 'teamName'),
  tms: state.auth.obj.tms,
  welcome: state.welcome
});

const WelcomeContainer = (props) => {
  const {dispatch, invitees, inviteesRaw, preferredName, teamName, history, tms, viewer, welcome} = props;
  const {completed} = welcome;
  const progressDotClickFactory = (dot) => (e) => {
    e.preventDefault();
    if (dot <= completed + 1) {
      dispatch(goToPage(dot));
    }
  };
  if (tms && completed === 0) {
    history.push('/me');
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
      viewer={viewer}
    />
  );
};

WelcomeContainer.propTypes = {
  dispatch: PropTypes.func,
  invitees: PropTypes.array,
  inviteesRaw: PropTypes.string,
  preferredName: PropTypes.string,
  history: PropTypes.object,
  teamName: PropTypes.string,
  tms: PropTypes.array,
  welcome: PropTypes.shape({
    existingInvites: PropTypes.array,
    teamId: PropTypes.string,
    teamMemberId: PropTypes.string
  }),
  viewer: PropTypes.object.isRequired
};

export default createFragmentContainer(
  withReducer({welcome: welcomeReducer})(
    connect(mapStateToProps)(
      WelcomeContainer
    )
  ),
  graphql`
    fragment WelcomeContainer_viewer on User {
      preferredName
      ...Welcome_viewer
    }
  `
);
