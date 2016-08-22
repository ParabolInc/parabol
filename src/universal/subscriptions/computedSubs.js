import subscriptions from 'universal/subscriptions/subscriptions';
import {PROJECTS, TEAM} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import {cashay} from 'cashay';

const teamSubQuery = subscriptions.find(sub => sub.channel === TEAM).string;
const projectSubQuery = subscriptions.find(sub => sub.channel === PROJECTS).string;

export const resolveActiveMeetings = (tms) => {
  const activeMeetings = [];
  for (let i = 0; i < tms.length; i++) {
    const teamId = tms[i];
    const {team} = cashay.subscribe(teamSubQuery, subscriber, {
      key: teamId,
      op: TEAM,
      variables: {teamId},
      dep: 'teamSubs'
    }).data;
    if (team.meetingId) {
      activeMeetings.push({
        link: `/meeting/${teamId}`,
        name: team.name
      });
    }
  }
  return activeMeetings;
};

export const resolveProjectsByMember = (teamMembers) => {
  const projectSubs = {};
  for (let i = 0; i < teamMembers.length; i++) {
    const teamMemberId = teamMembers[i].id;
    projectSubs[teamMemberId] = cashay.subscribe(projectSubQuery, subscriber, {
      key: teamMemberId,
      op: PROJECTS,
      variables: {teamMemberId},
      dep: 'projectSubs'
    }).data.projects;
  }
  return projectSubs;
};

export const resolveProjectSubs = (teamMembers) => {
  const projectSubs = [];
  for (let i = 0; i < teamMembers.length; i++) {
    const teamMemberId = teamMembers[i].id;
    projectSubs[i] = cashay.subscribe(projectSubQuery, subscriber, {
      key: teamMemberId,
      op: PROJECTS,
      variables: {teamMemberId},
      dep: 'projectSubs'
    }).data.projects;
  }
  return [].concat(...projectSubs);
};
