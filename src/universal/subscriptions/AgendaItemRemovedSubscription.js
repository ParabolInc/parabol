import {handleRemoveAgendaItem} from 'universal/mutations/RemoveAgendaItemMutation';

const subscription = graphql`
  subscription AgendaItemRemovedSubscription($teamId: ID!) {
    agendaItemRemoved(teamId: $teamId) {
      agendaItem {
        id
      }
    }
  }
`;

const AgendaItemRemovedSubscription = (environment, queryVariables) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const agendaId = store.getRootField('agendaItemRemoved')
        .getLinkedRecord('agendaItem')
        .getValue('id');
      handleRemoveAgendaItem(store, teamId, agendaId);
    }
  };
};

export default AgendaItemRemovedSubscription;
