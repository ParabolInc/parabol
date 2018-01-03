import {addAgendaItemUpdater} from 'universal/mutations/AddAgendaItemMutation';
import handleUpdateAgendaItems from 'universal/mutations/handlers/handleUpdateAgendaItems';
import {removeAgendaItemUpdater} from 'universal/mutations/RemoveAgendaItemMutation';

const subscription = graphql`
  subscription AgendaItemSubscription($teamId: ID!) {
    agendaItemSubscription(teamId: $teamId) {
      __typename
      ...AddAgendaItemMutation_payload
      ...RemoveAgendaItemMutation_payload
      ...UpdateAgendaItemMutation_payload
    }
  }
`;

const AgendaItemSubscription = (environment, queryVariables) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('agendaItemSubscription');
      const type = payload.getValue('__typename');
      if (type === 'AddAgendaItemPayload') {
        addAgendaItemUpdater(payload, store);
      } else if (type === 'RemoveAgendaItemPayload') {
        removeAgendaItemUpdater(payload, store);
      } else if (type === 'UpdateAgendaItemPayload') {
        handleUpdateAgendaItems(store, teamId);
      }
    }
  };
};

export default AgendaItemSubscription;
