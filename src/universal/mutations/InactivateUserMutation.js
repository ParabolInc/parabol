import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation InactivateUserMutation($userId: ID!) {
    inactivateUser(userId: $userId) {
      user {
        inactive
      }
    }
  }
`;

const InactivateUserMutation = (environment, userId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {userId},
    optimisticUpdater: (store) => {
      const user = store.get(userId);
      if (!user) return;
      user.setValue(true, 'inactive');
    },
    onCompleted,
    onError
  });
};

export default InactivateUserMutation;
