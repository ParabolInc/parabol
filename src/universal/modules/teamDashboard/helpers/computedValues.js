import subscriptions from 'universal/subscriptions/subscriptions';
import {AGENDA} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import {cashay} from 'cashay';

const agendaSubString = subscriptions.find(sub => sub.channel === AGENDA).string;

export const resolveSortedAgenda = (teamId) => {
  const variables = {teamId};
  const {agenda} = cashay.subscribe(agendaSubString, subscriber, {
    dependency: 'sortedAgenda',
    op: 'agendaSub',
    variables
  }).data;
  return agenda.sort((a, b) => a.sortOrder > b.sortOrder);
};
