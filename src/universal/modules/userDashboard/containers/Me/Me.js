import React, {PropTypes} from 'react';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import Me from 'universal/modules/userDashboard/components/Me/Me';
import {connect} from 'react-redux';
import reduxSocketOptions from 'universal/redux/reduxSocketOptions';
import {reduxSocket} from 'redux-socket-cluster';
import subscriptions from 'universal/subscriptions/subscriptions';
import {PROJECTS, TEAM, TEAM_MEMBERS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import {cashay} from 'cashay';

const teamSubString = subscriptions.find(sub => sub.channel === TEAM).string;
const projectSubString = subscriptions.find(sub => sub.channel === PROJECTS).string;

const makeActiveMeetings = (teamIds, teamSubs) => {
  const activeMeetings = [];
  for (let i = 0; i < teamIds.length; i++) {
    const teamId = teamIds[i];
    const {team} = teamSubs[teamId].data;
    if (team.meetingId) {
      activeMeetings.push({
        link: `/meeting/${teamId}`,
        name: team.name
      });
    }
  }
  return activeMeetings;
};

const makeProjectSubs = (teamMembersIds) => {
  const projectSubs = [];
  for (let i = 0; i < teamMembersIds.length; i++) {
    const teamMemberId = teamMembersIds[i];
    projectSubs[i] = cashay.subscribe(projectSubString, subscriber, {
      op: 'projectSub',
      key: teamMemberId,
      variables: {teamMemberId}
    });
  }
  return projectSubs;
};

const makeTeamSubs = (teams) => {
  const teamSubs = {};
  for (let i = 0; i < teams.length; i++) {
    const teamId = teams[i];
    teamSubs[teamId] = cashay.subscribe(teamSubString, subscriber, {
      op: 'teamSub',
      key: teamId,
      variables: {teamId}
    });
  }
  return teamSubs;
};

const mapStateToProps = (state, props) => {
  const {sub: userId, tms} = state.auth.obj;
  const teamMemberIds = tms.map(teamId => `${userId}::${teamId}`);
  const projectSubs = makeProjectSubs(teamMemberIds);
  const teamSubs = makeTeamSubs(tms);
  console.log('props', props)
  return {
    projectSubs,
    teamSubs,
    tms,
    preferredName: props.user.preferredName
  };
};

const MeContainer = (props) => {
  const {preferredName, projectSubs, teamSubs, tms} = props;
  const projects = [].concat(...projectSubs.map(sub => sub.data.projects));
  const activeMeetings = makeActiveMeetings(tms, teamSubs);
  return (
    <Me
      preferredName={preferredName}
      projects={projects}
      activeMeetings={activeMeetings}
    />
  );
};

MeContainer.propTypes = {
  user: PropTypes.shape({
    preferredName: PropTypes.string
  })
};

export default
requireAuth(
  connect(mapStateToProps)(
    reduxSocket({}, reduxSocketOptions)(
      MeContainer
    )
  )
);
