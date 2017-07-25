import {commitMutation} from 'react-relay';
import getArrayWithoutIds from 'universal/utils/relay/getArrayWithoutIds';
import {GITHUB} from 'universal/utils/constants';
import incrementIntegrationCount from 'universal/utils/relay/incrementIntegrationCount';

const mutation = graphql`
  mutation RemoveGitHubRepoMutation($githubGlobalId: ID!) {
    removeGitHubRepo(githubGlobalId: $githubGlobalId) {
      deletedId
    }
  }
`;

export const removeGitHubRepoUpdater = (viewer, teamId, deletedId) => {
  const githubRepos = viewer.getLinkedRecords('githubRepos', {teamId});
  if (githubRepos) {
    const newNodes = getArrayWithoutIds(githubRepos, deletedId);
    viewer.setLinkedRecords(newNodes, 'githubRepos', {teamId});
  }

  // update the providerMap
  incrementIntegrationCount(viewer, teamId, GITHUB, -1);
};

const RemoveGitHubRepoMutation = (environment, githubGlobalId, teamId) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {githubGlobalId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('removeGitHubRepo');
      const deletedId = payload.getValue('deletedId');
      removeGitHubRepoUpdater(viewer, teamId, deletedId);
    },
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId);
      removeGitHubRepoUpdater(viewer, teamId, githubGlobalId);
    },
    onError: (err) => {
      console.error('err', err);
    }
  });
};

export default RemoveGitHubRepoMutation;
