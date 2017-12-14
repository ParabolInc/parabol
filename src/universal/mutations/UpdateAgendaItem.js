import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation UpdateAgendaItemMutation($updatedAgendaItem: UpdateAgendaItemInput!) {
    updateAgendaItem(updatedAgendaItem: $updatedAgendaItem) {
      agendaItem {
        id
        isComplete
        sortOrder
      }
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
