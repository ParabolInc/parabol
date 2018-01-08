import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const handleRemoveAgendaItem = (agendaItemId, store) => {
  const agendaItem = store.get(agendaItemId);
  if (!agendaItem) return;
  const teamId = agendaItem.getValue('id').split('::')[0];
  const team = store.get(teamId);
  safeRemoveNodeFromArray(agendaItemId, team, 'agendaItems');
};

const handleRemoveAgendaItems = pluralizeHandler(handleRemoveAgendaItem);
export default handleRemoveAgendaItems;
