import {commitMutation} from 'react-relay';
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord';

const mutation = graphql`
  mutation UpdateAgendaItemMutation($updatedAgendaItem: UpdateAgendaItemInput!) {
    updateAgendaItem(updatedAgendaItem: $updatedAgendaItem) {
      agendaItem {
        id
        content
        isComplete
        sortOrder
        teamId
        teamMember {
          id
          picture
          preferredName
        }
      }
    }
  }
`;

export const handleUpdateAgendaItem = (store, teamId) => {
  const team = store.get(teamId);
  const agendaItems = team.getLinkedRecords('agendaItems');
  if (!agendaItems) return;
  agendaItems.sort((a, b) => {
    return a.getValue('sortOrder') > b.getValue('sortOrder') ? 1 : -1;
  });
  team.setLinkedRecords(agendaItems, 'agendaItems');
};

const UpdateAgendaItemMutation = (environment, updatedAgendaItem, onError, onCompleted) => {
  const [teamId] = updatedAgendaItem.id.split('::');
  return commitMutation(environment, {
    mutation,
    variables: {updatedAgendaItem},
    updater: (store) => {
      handleUpdateAgendaItem(store, teamId);
    },
    optimisticUpdater: (store) => {
      const proxyAgendaItem = store.get(updatedAgendaItem.id);
      if (!proxyAgendaItem) return;
      updateProxyRecord(proxyAgendaItem, updatedAgendaItem);
      handleUpdateAgendaItem(store, teamId);
    },
    onCompleted,
    onError
  });
};

export default UpdateAgendaItemMutation;
