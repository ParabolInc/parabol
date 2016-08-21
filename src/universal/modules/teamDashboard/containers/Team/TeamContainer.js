import React, {PropTypes} from 'react';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import subscriptions from 'universal/subscriptions/subscriptions';
import subscriber from 'universal/subscriptions/subscriber';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import {TEAM, TEAM_MEMBERS} from 'universal/subscriptions/constants';
import LoadingView from 'universal/components/LoadingView/LoadingView';

const teamSubQuery = subscriptions.find(sub => sub.channel === TEAM).string;
const teamMembersSubQuery = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;

const mapStateToProps = (state, props) => {
  const {teamId} = props.params;
  const {sub: userId} = state.auth.obj;
  const {teamMembers} = cashay.subscribe(teamMembersSubQuery, subscriber, {
    op: TEAM_MEMBERS,
    variables: {teamId}
  }).data;
  const {team} = cashay.subscribe(teamSubQuery, subscriber, {
    op: TEAM,
    key: teamId,
    variables: {teamId},
  }).data;
  return {
    team,
    myTeamMemberId: `${userId}::${teamId}`,
    teamMembers,
  };
};

const TeamContainer = (props) => {
  const {team, myTeamMemberId, teamMembers} = props;
  const readyEnough = team.id && teamMembers.length > 0;
  if (!readyEnough) {
    return <LoadingView/>;
  }
  return (
    <Team
      team={team}
      myTeamMemberId={myTeamMemberId}
      teamMembers={teamMembers}
    />
  );
};

TeamContainer.propTypes = {
  team: PropTypes.object.isRequired,
  myTeamMemberId: PropTypes.string.isRequired,
  teamMembers: PropTypes.array.isRequired,
};

export default requireAuth(
  connect(mapStateToProps)(
    socketWithPresence(TeamContainer)
  )
);
