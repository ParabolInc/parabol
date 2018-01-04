import {commitMutation} from 'react-relay';
import handleUpdateAgendaItems from 'universal/mutations/handlers/handleUpdateAgendaItems';
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord';

graphql`
  fragment UpdateAgendaItemMutation_agendaItem on UpdateAgendaItemPayload {
    agendaItem {
      id
      isComplete
      sortOrder
    }
  }
`;

const mutation = graphql`
  mutation UpdateAgendaItemMutation($updatedAgendaItem: UpdateAgendaItemInput!) {
    updateAgendaItem(updatedAgendaItem: $updatedAgendaItem) {
      ...UpdateAgendaItemMutation_agendaItem @relay(mask: false)
    }
  }
`;

const UpdateAgendaItemMutation = (environment, updatedAgendaItem, onError, onCompleted) => {
  const [teamId] = updatedAgendaItem.id.split('::');
  return commitMutation(environment, {
    mutation,
    variables: {updatedAgendaItem},
    updater: (store) => {
      handleUpdateAgendaItems(store, teamId);
    },
    optimisticUpdater: (store) => {
      const proxyAgendaItem = store.get(updatedAgendaItem.id);
      updateProxyRecord(proxyAgendaItem, updatedAgendaItem);
      handleUpdateAgendaItems(store, teamId);
    },
    onCompleted,
    onError
  });
};

export default UpdateAgendaItemMutation;
