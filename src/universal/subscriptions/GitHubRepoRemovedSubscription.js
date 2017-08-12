import {removeGitHubRepoUpdater} from 'universal/mutations/RemoveGitHubRepoMutation';

const subscription = graphql`
  subscription GitHubRepoRemovedSubscription($teamId: ID!) {
    githubRepoRemoved(teamId: $teamId) {
      deletedId
    }
  }
`;

const GitHubRepoRemovedSubscription = (environment, queryVariables) => {
  const {ensureSubscription, viewerId} = environment;
  const {teamId} = queryVariables;
  return ensureSubscription({
    subscription,
    variables: {teamId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const removedRepo = store.getRootField('githubRepoRemoved');
      const deletedId = removedRepo.getValue('deletedId');
      removeGitHubRepoUpdater(viewer, teamId, deletedId);
    }
  });
};

export default GitHubRepoRemovedSubscription;
