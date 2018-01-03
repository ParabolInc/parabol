import {commitMutation} from 'react-relay';

graphql`
  fragment UpdateAgendaItemMutation_payload on UpdateAgendaItemPayload {
    agendaItem {
      id
      isComplete
      sortOrder
    }
  }
`;

const mutation = graphql`
  mutation UpdateAgendaItemMutation($updatedAgendaItem: UpdateAgendaItemInput!) {
    updateAgendaItem(updatedAgendaItem: $updatedAgendaItem) {
      ...UpdateAgendaItemMutation_payload @relay(mask: false)      
    }
  }
`;

const UpdateAgendaItem = (environment, updatedAgendaItem, onCompleted, onError) => {
  return commitMutation(environment, {
    mutation,
    variables: {updatedAgendaItem},
    onCompleted,
    onError
  });
};

export default UpdateAgendaItem;
