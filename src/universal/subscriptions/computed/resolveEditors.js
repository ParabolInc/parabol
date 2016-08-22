import {cashay} from 'cashay';
import subscriber from 'universal/subscriptions/subscriber';
import presenceSubscriber from 'universal/subscriptions/presenceSubscriber';
import presenceEditingHelper from 'universal/subscriptions/presenceEditingHelper';
import subscriptions from 'universal/subscriptions/subscriptions';
import {PRESENCE, TEAM_MEMBERS} from 'universal/subscriptions/constants';

const presenceSubQuery = subscriptions.find(sub => sub.channel === PRESENCE).string;
const teamMembersSubQuery = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;

export default function resolveEditors(myPreferredName, task) {
  const [teamId] = task.split('::');
  const variables = {teamId};
  const {presence} = cashay.subscribe(presenceSubQuery, presenceSubscriber, {
    key: teamId,
    dep: 'editingByTeam',
    op: PRESENCE,
    variables
  }).data;
  const {teamMembers} = cashay.subscribe(teamMembersSubQuery, subscriber, {
    key: teamId,
    dep: 'editingByTeam',
    op: TEAM_MEMBERS,
    variables,
  }).data;
  const editsByObj = presenceEditingHelper(presence);
  const userIdSet = editsByObj[`Task::${task}`];
  const userIdArr = userIdSet ? [...userIdSet] : [];
  return userIdArr.map(userId => {
    const teamMember = teamMembers.find(m => m.id.startsWith(userId)) || {};
    return teamMember.preferredName === myPreferredName ? 'You (other device)' : teamMember.preferredName;
  });
}
