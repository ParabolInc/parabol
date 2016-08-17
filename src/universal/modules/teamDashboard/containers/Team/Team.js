import React, {PropTypes} from 'react';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import subscriptions from 'universal/subscriptions/subscriptions';
import {PROJECTS, TEAM, TEAM_MEMBERS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import {cashay} from 'cashay';
import {connect} from 'react-redux';

const teamMembersSubString = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;
const teamSubString = subscriptions.find(sub => sub.channel === TEAM).string;
const projectSubString = subscriptions.find(sub => sub.channel === PROJECTS).string;

const resolveProjectSubs = (teamMembers) => {
  const projectSubs = [];
  for (let i = 0; i < teamMembers.length; i++) {
    const teamMemberId = teamMembers[i].id;
    projectSubs[i] = cashay.subscribe(projectSubString, subscriber, {
      op: 'projectSub',
      key: teamMemberId,
      variables: {teamMemberId},
      dependency: 'projectSubs'
    }).data.projects;
  }
  return [].concat(...projectSubs);
};

const resolveTeamsAndMeetings = (tms) => {
  const teamSubs = {};
  const activeMeetings = [];
  for (let i = 0; i < tms.length; i++) {
    const teamId = tms[i];
    const {team} = cashay.subscribe(teamSubString, subscriber, {
      op: 'teamSub',
      key: teamId,
      variables: {teamId},
      dependency: 'teamSubs'
    }).data;
    if (team.meetingId) {
      activeMeetings.push({
        link: `/meeting/${teamId}`,
        name: team.name
      });
    }
    teamSubs[teamId] = team;
  }
  return {activeMeetings, teamSubs};
};


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
    presenceSub: {data: {editing}},
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
  presenceSub: PropTypes.shape({
    data: PropTypes.shape({
      editing: PropTypes.object.isRequired
    })
  }),
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
