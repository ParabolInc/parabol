import presenceSubscriber from 'universal/subscriptions/presenceSubscriber';
import {cashay} from 'cashay';
import subscriptions from 'universal/subscriptions/subscriptions';
import presenceEditingHelper from 'universal/subscriptions/presenceEditingHelper';
import {PRESENCE} from 'universal/subscriptions/constants';

const presenceSubscription = subscriptions.find(sub => sub.channel === PRESENCE);

export default function resolveEditingByTeam(teamId) {
  const presenceSubOptions = {
    variables: {teamId},
    op: 'presenceByTeam',
    dep: 'editingByTeam'
  };
  const {presence} = cashay.subscribe(presenceSubscription.string, presenceSubscriber, presenceSubOptions).data;
  return presenceEditingHelper(presence);
};
