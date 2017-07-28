import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation CreateGitHubIssueMutation($nameWithOwner: String!, $projectId: ID!) {
    createGitHubIssue(nameWithOwner: $nameWithOwner, projectId: $projectId)
  }
`;

const CreateGitHubIssueMutation = (environment, nameWithOwner, projectId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {nameWithOwner, projectId},
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
