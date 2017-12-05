import {addAgendaItemUpdater} from 'universal/mutations/AddAgendaItemMutation';

const subscription = graphql`
  subscription AgendaItemAddedSubscription($teamId: ID!) {
    agendaItemAdded(teamId: $teamId) {
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

const AgendaItemAddedSubscription = (environment, queryVariables) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const newNode = store.getRootField('agendaItemAdded').getLinkedRecord('agendaItem');
      addAgendaItemUpdater(store, teamId, newNode);
    }
  };
};

export default AgendaItemAddedSubscription;
