import {commitMutation} from 'react-relay';
import handleAddAgendaItems from 'universal/mutations/handlers/handleAddAgendaItems';
import clientTempId from 'universal/utils/relay/clientTempId';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';

graphql`
  fragment AddAgendaItemMutation_agendaItem on AddAgendaItemPayload {
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
`;

const mutation = graphql`
  mutation AddAgendaItemMutation($newAgendaItem: CreateAgendaItemInput!) {
    addAgendaItem(newAgendaItem: $newAgendaItem) {
      ...AddAgendaItemMutation_agendaItem @relay(mask: false)
    }
  }
`;

export const addAgendaItemUpdater = (payload, store) => {
  const agendaItem = payload.getLinkedRecord('agendaItem');
  handleAddAgendaItems(agendaItem, store);
};

const AddAgendaItemMutation = (environment, newAgendaItem, onError, onCompleted) => {
  const {teamId} = newAgendaItem;
  return commitMutation(environment, {
    mutation,
    variables: {newAgendaItem},
    updater: (store) => {
      const payload = store.getRootField('addAgendaItem');
      addAgendaItemUpdater(payload, store);
    },
    optimisticUpdater: (store) => {
      const optimisticAgendaItem = {
        ...newAgendaItem,
        id: clientTempId(teamId),
        isActive: true,
        isComplete: false
      };
      const agendaItemNode = createProxyRecord(store, 'AgendaItem', optimisticAgendaItem);
      handleAddAgendaItems(agendaItemNode, store);
    },
    onCompleted,
    onError
  });
};

export default AddAgendaItemMutation;
