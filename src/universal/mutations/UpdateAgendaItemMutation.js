import {commitMutation} from 'react-relay';
import addNodeToArray from 'universal/utils/relay/addNodeToArray';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';
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

export const handleUpdateAgendaItem = (store, teamId, node, sortOrderChanged) => {
  if (!sortOrderChanged) return;
  const team = store.get(teamId);
  const nodeId = node.getValue('id');
  safeRemoveNodeFromArray(nodeId, team, 'agendaItems');
  addNodeToArray(node, team, 'agendaItems', 'sortOrder');
};

const UpdateAgendaItemMutation = (environment, updatedAgendaItem, onError, onCompleted) => {
  const [teamId] = updatedAgendaItem.id.split('::');
  const sortOrderChanged = updatedAgendaItem.hasOwnProperty('sortOrder');
  return commitMutation(environment, {
    mutation,
    variables: {updatedAgendaItem},
    updater: (store) => {
      const node = store.getRootField('updateAgendaItem').getLinkedRecord('agendaItem');
      handleUpdateAgendaItem(store, teamId, node, sortOrderChanged);
    },
    optimisticUpdater: (store) => {
      const proxyAgendaItem = store.get(updatedAgendaItem.id);
      if (!proxyAgendaItem) return;
      const agendaItemNode = updateProxyRecord(proxyAgendaItem, updatedAgendaItem);
      handleUpdateAgendaItem(store, teamId, agendaItemNode, sortOrderChanged);
    },
    onCompleted,
    onError
  });
};

export default UpdateAgendaItemMutation;
