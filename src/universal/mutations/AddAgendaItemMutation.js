import clientTempId from 'universal/utils/relay/clientTempId';
import {commitMutation} from 'react-relay';
import addNodeToArray from 'universal/utils/relay/addNodeToArray';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';

const mutation = graphql`
  mutation AddAgendaItemMutation($newAgendaItem: CreateAgendaItemInput!) {
    addAgendaItem(newAgendaItem: $newAgendaItem) {
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

export const handleAddAgendaItemUpdater = (store, teamId, newNode) => {
  const team = store.get(teamId);
  addNodeToArray(newNode, team, 'agendaItems', 'sortOrder');
};

const AddAgendaItemMutation = (environment, newAgendaItem, onError, onCompleted) => {
  const {teamId} = newAgendaItem;
  return commitMutation(environment, {
    mutation,
    variables: {newAgendaItem},
    updater: (store) => {
      const node = store.getRootField('addAgendaItem').getLinkedRecord('agendaItem');
      handleAddAgendaItemUpdater(store, teamId, node);
    },
    optimisticUpdater: (store) => {
      const optimisticAgendaItem = {
        ...newAgendaItem,
        id: clientTempId(teamId),
        isActive: true,
        isComplete: false
      };
      const agendaItemNode = createProxyRecord(store, 'AgendaItem', optimisticAgendaItem);
      handleAddAgendaItemUpdater(store, teamId, agendaItemNode);
    },
    onCompleted,
    onError
  });
};

export default AddAgendaItemMutation;
