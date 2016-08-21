import subscriptions from 'universal/subscriptions/subscriptions';
import {PROJECTS, TEAM} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import {cashay} from 'cashay';

const teamSubString = subscriptions.find(sub => sub.channel === TEAM).string;
const projectSubString = subscriptions.find(sub => sub.channel === PROJECTS).string;

export const resolveEditingByTeam = (teamId) => {
  const presenceSubOptions = {
    variables: {teamId},
    op: 'presenceByTeam',
    dependency: 'editingByTeam'
  };
  const {presence} = cashay.subscribe(presenceSubscription.string, presenceSubscriber, presenceSubOptions).data;
  return presenceEditingHelper(presence);
};

export const resolveActiveMeetings = (tms) => {
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
  }
  return activeMeetings;
};

export const resolveProjectsByMember = (teamMembers) => {
  const projectSubs = {};
  for (let i = 0; i < teamMembers.length; i++) {
    const teamMemberId = teamMembers[i].id;
    projectSubs[teamMemberId] = cashay.subscribe(projectSubString, subscriber, {
      op: 'projectSub',
      key: teamMemberId,
      variables: {teamMemberId},
      dependency: 'projectSubs'
    }).data.projects;
  }
  return projectSubs;
};

export const resolveProjectSubs = (teamMembers) => {
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

export const resolveMembers = (teamId, presenceSub, myId, teamMembers, team) => {
  const {presence} = presenceSub.data;
  const members = [];
  for (let i = 0; i < teamMembers.length; i++) {
    const member = teamMembers[i];
    // member.id is of format 'userId::teamId'
    const [userId] = member.id.split('::');
    members[i] = {
      ...member,
      isConnected: Boolean(presence.find(connection => connection.userId === userId)),
      isFacilitator: team.activeFacilitator === member.id,
      isSelf: myId === userId
    };
  }
  return members.sort((a, b) => b.checkInOrder <= a.checkInOrder);
};
