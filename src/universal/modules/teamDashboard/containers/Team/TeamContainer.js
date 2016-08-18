import React, {PropTypes} from 'react';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import subscriptions from 'universal/subscriptions/subscriptions';
import {TEAM_MEMBERS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import {resolveProjectSubs, resolveTeamsAndMeetings} from 'universal/subscriptions/computedSubs';

const teamMembersSubString = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;

const mapStateToProps = (state, props) => {
  const {teamId} = props.params;
  const {teamMembers} = cashay.subscribe(teamMembersSubString, subscriber, {
    op: 'teamMembers',
    variables: {teamId}
  }).data;
  const projects = cashay.computed('projectSubs', [teamMembers], resolveProjectSubs);
  const {activeMeetings, teamSubs} = cashay.computed('teamSubs', [state.auth.obj.tms], resolveTeamsAndMeetings);
  return {
    activeMeetings,
    teamMembers,
    projects,
    team: teamSubs[teamId]
  };
};

const TeamContainer = (props) => {
  const {
    activeMeetings,
    teamMembers,
    editing,
    projects,
    team,
    params: {teamId},
    user,
    dispatch
  } = props;
  return (
    <Team
      activeMeetings={activeMeetings}
      editing={editing}
      projects={projects}
      teamId={teamId}
      team={team}
      teamMembers={teamMembers}
      user={user}
      dispatch={dispatch}
    />
  );
};

TeamContainer.propTypes = {
  activeMeetings: PropTypes.array,
  teamMembers: PropTypes.array.isRequired,
  projects: PropTypes.array.isRequired,

  dispatch: PropTypes.func,
  user: PropTypes.object,
  editing: PropTypes.object.isRequired,
  params: PropTypes.shape({
    teamId: PropTypes.string.isRequired
  }),
  team: PropTypes.object,
};

export default requireAuth(
  connect(mapStateToProps)(
    socketWithPresence(TeamContainer)
  )
);
