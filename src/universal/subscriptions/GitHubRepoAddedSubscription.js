// import storeDebugger from 'relay-runtime/lib/RelayStoreProxyDebugger';
import {addGitHubRepoUpdater} from 'universal/mutations/AddGitHubRepoMutation';

const AddedSubscription = graphql`
  subscription GitHubRepoAddedSubscription($teamId: ID!) {
    githubRepoAdded(teamId: $teamId) {
      repo {
        id
        nameWithOwner
        users {
          id
          preferredName
          picture
        }
      }
    }
  }
`;

const GitHubRepoAddedSubscription = (teamId, viewerId) => (ensureSubscription) => {
  return ensureSubscription({
    subscription: AddedSubscription,
    variables: {teamId},
    updater: (store) => {
      const newNode = store.getRootField('githubRepoAdded').getLinkedRecord('repo');
      addGitHubRepoUpdater(store, viewerId, teamId, newNode);
    }
  });
};

export default GitHubRepoAddedSubscription;
