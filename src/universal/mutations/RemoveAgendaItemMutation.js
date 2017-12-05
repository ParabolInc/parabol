import {commitMutation} from 'react-relay';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const mutation = graphql`
  mutation RemoveAgendaItemMutation($id: ID!) {
    removeAgendaItem(id: $id) {
      agendaItem {
        id
      }
    }
  }
`;

export const handleRemoveAgendaItem = (store, teamId, nodeId) => {
  const team = store.get(teamId);
  safeRemoveNodeFromArray(nodeId, team, 'agendaItems');
};

const RemoveAgendaItemMutation = (environment, agendaId, onError, onCompleted) => {
  const [teamId] = agendaId.split('::');
  return commitMutation(environment, {
    mutation,
    variables: {id: agendaId},
    updater: (store) => {
      handleRemoveAgendaItem(store, teamId, agendaId);
    },
    optimisticUpdater: (store) => {
      handleRemoveAgendaItem(store, teamId, agendaId);
    },
    onCompleted,
    onError
  });
};

export default RemoveAgendaItemMutation;
