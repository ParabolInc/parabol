import {commitMutation} from 'react-relay';
import getArrayWithoutIds from 'universal/utils/relay/getArrayWithoutIds';

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
};

const RemoveGitHubRepoMutation = (environment, githubGlobalId, teamId, viewerId) => {
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
      console.log('err', err);
    }
  });
};

export default RemoveGitHubRepoMutation;
