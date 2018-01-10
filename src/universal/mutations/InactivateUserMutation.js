import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation InactivateUserMutation($userId: ID!) {
    inactivateUser(userId: $userId)
  }
`;

const InactivateUserMutation = (environment, userId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {userId},
    onCompleted,
    onError
  });
};

export default InactivateUserMutation;
