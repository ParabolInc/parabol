import {handleUpdateAgendaItem} from 'universal/mutations/UpdateAgendaItemMutation';

const subscription = graphql`
  subscription AgendaItemUpdatedSubscription($teamId: ID!) {
    agendaItemUpdated(teamId: $teamId) {
      agendaItem {
        id
        isComplete
        sortOrder
      }
    }
  }
`;

const AgendaItemUpdatedSubscription = (environment, queryVariables) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const newNode = store.getRootField('agendaItemUpdated').getLinkedRecord('agendaItem');
      handleUpdateAgendaItem(store, teamId, newNode, true);
    }
  };
};

export default AgendaItemUpdatedSubscription;
