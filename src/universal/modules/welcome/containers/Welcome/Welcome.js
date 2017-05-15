import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {formValueSelector} from 'redux-form';
import {goToPage} from 'universal/modules/welcome/ducks/welcomeDuck';
import Welcome from 'universal/modules/welcome/components/Welcome/Welcome';
import welcomeReducer from 'universal/modules/welcome/ducks/welcomeDuck';
import withReducer from '../../../../decorators/withReducer/withReducer';
import {cashay} from 'cashay';
import {getAuthedOptions, getAuthQueryString} from 'universal/redux/getAuthedUser';

const selector = formValueSelector('welcomeWizard');
const rawSelector = formValueSelector('welcomeWizardRawInvitees');

const mapStateToProps = (state, props) => ({
  invitees: selector(state, 'invitees'),
  inviteesRaw: rawSelector(state, 'inviteesRaw'),
  // default to something nice
  preferredName: selector(state, 'preferredName') || (props.user && props.user.preferredName),
  teamName: selector(state, 'teamName'),
  tms: state.auth.obj.tms,
  user: cashay.query(getAuthQueryString, getAuthedOptions(state.auth.obj.sub)).data.user,
  welcome: state.welcome
});

const WelcomeContainer = (props) => {
  const {dispatch, invitees, inviteesRaw, preferredName, teamName, history, tms, user, welcome} = props;
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
      user={user}
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
  user: PropTypes.object.isRequired,
  welcome: PropTypes.shape({
    existingInvites: PropTypes.array,
    teamId: PropTypes.string,
    teamMemberId: PropTypes.string
  })
};

export default withReducer({welcome: welcomeReducer})(
  connect(mapStateToProps)(
    WelcomeContainer
  )
);
