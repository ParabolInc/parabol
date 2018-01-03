import {commitMutation} from 'react-relay';
import handleRemoveAgendaItems from 'universal/mutations/handlers/handleRemoveAgendaItems';
import getInProxy from 'universal/utils/relay/getInProxy';

graphql`
  fragment RemoveAgendaItemMutation_payload on RemoveAgendaItemPayload {
    agendaItem {
      id
    }
  }
`;

const mutation = graphql`
  mutation RemoveAgendaItemMutation($agendaItemId: ID!) {
    removeAgendaItem(agendaItemId: $agendaItemId) {
      ...RemoveAgendaItemMutation_payload @relay(mask: false)
    }
  }
`;

export const removeAgendaItemUpdater = (payload, store) => {
  const agendaItemId = getInProxy(payload, 'agendaItem', 'id');
  handleRemoveAgendaItems(agendaItemId, store);
};

const RemoveAgendaItemMutation = (environment, agendaItemId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {agendaItemId},
    updater: (store) => {
      const payload = store.getRootField('removeAgendaItem');
      removeAgendaItemUpdater(payload, store);
    },
    optimisticUpdater: (store) => {
      handleRemoveAgendaItems(agendaItemId, store);
    },
    onCompleted,
    onError
  });
};

export default RemoveAgendaItemMutation;
