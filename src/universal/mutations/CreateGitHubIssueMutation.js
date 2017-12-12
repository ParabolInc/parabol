import {commitMutation} from 'react-relay';
import {GITHUB} from 'universal/utils/constants';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';

const mutation = graphql`
  mutation CreateGitHubIssueMutation($nameWithOwner: String!, $projectId: ID!) {
    createGitHubIssue(nameWithOwner: $nameWithOwner, projectId: $projectId) {
      project {
        integration {
          issueNumber
          service
          nameWithOwner
        }
        updatedAt
      }
    }
  }
`;

const CreateGitHubIssueMutation = (environment, nameWithOwner, projectId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {nameWithOwner, projectId},
    optimisticUpdater: (store) => {
      const now = new Date();
      const project = store.get(projectId);
      const optimisticIntegration = {
        service: GITHUB,
        nameWithOwner,
        issueNumber: 1,
        updatedAt: now.toJSON()
      };
      const integration = createProxyRecord(store, 'GitHubProject', optimisticIntegration);
      project.setLinkedRecord(integration, 'integration');
    },
    onCompleted,
    onError
  });
};

export default CreateGitHubIssueMutation;
