import {addAgendaItemUpdater} from 'universal/mutations/AddAgendaItemMutation';
import handleUpdateAgendaItems from 'universal/mutations/handlers/handleUpdateAgendaItems';
import {removeAgendaItemUpdater} from 'universal/mutations/RemoveAgendaItemMutation';

const subscription = graphql`
  subscription AgendaItemSubscription($teamId: ID!) {
    agendaItemSubscription(teamId: $teamId) {
      __typename
      ...AddAgendaItemMutation_agendaItem
      ...RemoveAgendaItemMutation_agendaItem
      ...UpdateAgendaItemMutation_agendaItem
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
      switch (type) {
        case 'AddAgendaItemPayload':
          addAgendaItemUpdater(payload, store);
          break;
        case 'RemoveAgendaItemPayload':
          removeAgendaItemUpdater(payload, store);
          break;
        case 'UpdateAgendaItemPayload':
          handleUpdateAgendaItems(store, teamId);
          break;
        default:
          console.error('TeamSubscription case fail', type);
      }
    }
  };
};

export default AgendaItemSubscription;
