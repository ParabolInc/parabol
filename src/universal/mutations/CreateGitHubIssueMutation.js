import {commitMutation} from 'react-relay';
import {GITHUB} from 'universal/utils/constants';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';

graphql`
  fragment CreateGitHubIssueMutation_task on CreateGitHubIssuePayload {
    task {
      integration {
        issueNumber
        service
        nameWithOwner
      }
      updatedAt
    }
  }
`;

const mutation = graphql`
  mutation CreateGitHubIssueMutation($nameWithOwner: String!, $taskId: ID!) {
    createGitHubIssue(nameWithOwner: $nameWithOwner, taskId: $taskId) {
      ...CreateGitHubIssueMutation_task @relay(mask: false)
    }
  }
`;

const CreateGitHubIssueMutation = (environment, nameWithOwner, taskId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {nameWithOwner, taskId},
    optimisticUpdater: (store) => {
      const now = new Date();
      const task = store.get(taskId);
      const optimisticIntegration = {
        service: GITHUB,
        nameWithOwner,
        issueNumber: 1,
        updatedAt: now.toJSON()
      };
      const integration = createProxyRecord(store, 'GitHubTask', optimisticIntegration);
      task.setLinkedRecord(integration, 'integration');
    },
    onCompleted,
    onError
  });
};

export default CreateGitHubIssueMutation;
