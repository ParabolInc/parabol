import React, {PropTypes} from 'react';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import Me from 'universal/modules/userDashboard/components/Me/Me';
import {connect} from 'react-redux';
import reduxSocketOptions from 'universal/redux/reduxSocketOptions';
import {reduxSocket} from 'redux-socket-cluster';
import {cashay} from 'cashay';
import {resolveProjectSubs, resolveTeamsAndMeetings} from 'universal/subscriptions/computedSubs';

// memoized
const makeTeamMembers = (userId, tms) => {
  if (tms !== makeTeamMembers.tms || userId !== makeTeamMembers.userId) {
    makeTeamMembers.tms = tms;
    makeTeamMembers.userId = userId;
    makeTeamMembers.cache = tms.map(teamId => ({id: `${userId}::${teamId}`}));
  }
  return makeTeamMembers.cache;
};

const mapStateToProps = (state, props) => {
  const {sub: userId, tms} = state.auth.obj;
  const teamMembers = makeTeamMembers(userId, tms);
  const {activeMeetings, teamSubs} = cashay.computed('teamSubs', [state.auth.obj.tms], resolveTeamsAndMeetings);
  const projects = cashay.computed('projectSubs', [teamMembers], resolveProjectSubs);
  return {
    activeMeetings,
    projects,
    teamSubs,
    preferredName: props.user.preferredName
  };
};

const MeContainer = (props) => {
  const {activeMeetings, preferredName, projects} = props;
  return (
    <Me
      preferredName={preferredName}
      projects={projects}
      activeMeetings={activeMeetings}
    />
  );
};

MeContainer.propTypes = {
  activeMeetings: PropTypes.array.isRequired,
  preferredName: PropTypes.string.isRequired,
  projects: PropTypes.array.isRequired
};

export default
requireAuth(
  connect(mapStateToProps)(
    reduxSocket({}, reduxSocketOptions)(
      MeContainer
    )
  )
);
