import presenceSubscriber from 'universal/subscriptions/presenceSubscriber';
import {cashay} from 'cashay';
import subscriptions from 'universal/subscriptions/subscriptions';
import presenceEditingHelper from 'universal/subscriptions/presenceEditingHelper';
import {PRESENCE} from 'universal/subscriptions/constants';

const presenceSubQuery = subscriptions.find(sub => sub.channel === PRESENCE).string;

export default function resolveEditingByTeam(teamId) {
  const presenceSubOptions = {
    key: teamId,
    variables: {teamId},
    op: PRESENCE,
    dep: 'editingByTeam'
  };
  const {presence} = cashay.subscribe(presenceSubQuery, presenceSubscriber, presenceSubOptions).data;
  return presenceEditingHelper(presence);
};
