import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation CreateGitHubIssueMutation($nameWithOwner: String!, $taskId: ID!) {
    createGitHubIssue(nameWithOwner: $nameWithOwner, taskId: $taskId)
  }
`;

const CreateGitHubIssueMutation = (environment, nameWithOwner, taskId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {nameWithOwner, taskId},
    updater: () => {
    },
    // TODO cashay
    optimisticUpdater: () => {
      // TODO cashay
    },
    onCompleted,
    onError
  });
};

export default CreateGitHubIssueMutation;
