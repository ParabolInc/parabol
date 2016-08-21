import {cashay} from 'cashay';
import subscriber from 'universal/subscriptions/subscriber';
import presenceSubscriber from 'universal/subscriptions/presenceSubscriber';
import presenceEditingHelper from 'universal/subscriptions/presenceEditingHelper';
import subscriptions from 'universal/subscriptions/subscriptions';
import {PRESENCE, TEAM_MEMBERS} from 'universal/subscriptions/constants';

const presenceSubscription = subscriptions.find(sub => sub.channel === PRESENCE);
const teamMembersSubString = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;

export default function resolveEditors(myPreferredName, task) {
  const [teamId] = task.split('::');
  const variables = {teamId};
  const {presence} = cashay.subscribe(presenceSubscription.string, presenceSubscriber, {
    variables,
    op: 'presenceByTeam',
    dep: 'editingByTeam'
  }).data;
  const {teamMembers} = cashay.subscribe(teamMembersSubString, subscriber, {
    op: 'memberSub',
    variables,
    dep: 'editingByTeam'
  }).data;
  const editsByObj = presenceEditingHelper(presence);
  const userIdSet = editsByObj[`Task::${task}`];
  const userIdArr = userIdSet ? [...userIdSet] : [];
  return userIdArr.map(userId => {
    const teamMember = teamMembers.find(m => m.id.startsWith(userId)) || {};
    return teamMember.preferredName === myPreferredName ? 'You (other device)' : teamMember.preferredName;
  });
};
