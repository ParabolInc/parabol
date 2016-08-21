import {cashay} from 'cashay';
import subscriber from 'universal/subscriptions/subscriber';
import presenceSubscriber from 'universal/subscriptions/presenceSubscriber';
import subscriptions from 'universal/subscriptions/subscriptions';
import {PRESENCE, TEAM, TEAM_MEMBERS} from 'universal/subscriptions/constants';

const presenceSubQuery = subscriptions.find(sub => sub.channel === PRESENCE).string;
const teamSubQuery = subscriptions.find(sub => sub.channel === TEAM).string;
const teamMembersSubQuery = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;

export default function resolveMeetingMembers(teamId, myId) {
  const variables = {teamId};
  const dep = 'meetingMembers';
  const {teamMembers} = cashay.subscribe(teamMembersSubQuery, subscriber, {
    key: teamId,
    dep,
    op: TEAM_MEMBERS,
    variables,
  }).data;
  const {team} = cashay.subscribe(teamSubQuery, subscriber, {
    key: teamId,
    dep,
    op: TEAM,
    variables
  }).data;
  const {presence} = cashay.subscribe(presenceSubQuery, presenceSubscriber, {
    key: teamId,
    variables,
    op: PRESENCE,
    dep
  }).data;
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
