import {commitMutation} from 'react-relay';
import getArrayWithoutIds from 'universal/utils/relay/getArrayWithoutIds';

const mutation = graphql`
  mutation LeaveIntegrationMutation($globalId: ID!) {
    leaveIntegration(globalId: $globalId) {
      integrationId
      userId
    }
  }
`;

export const removeGitHubRepoUpdater = (viewer, teamId, payload) => {

  const githubRepos = viewer.getLinkedRecords('githubRepos', {teamId});
  const newNodes = getArrayWithoutIds(githubRepos, deletedId);
  viewer.setLinkedRecords(newNodes, 'githubRepos', {teamId});
};

const LeaveIntegrationMutation = (environment, githubGlobalId, teamId, viewerId) => {
  return commitMutation(environment, {
    mutation,
    variables: {githubGlobalId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('leaveIntegration');
      removeGitHubRepoUpdater(viewer, teamId, payload);
    },
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId);
      removeGitHubRepoUpdater(viewer, teamId, githubGlobalId);
    },
    onError: (err) => {
      console.log('err', err);
    }
  });
};

export default LeaveIntegrationMutation;
