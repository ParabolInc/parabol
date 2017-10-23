// import storeDebugger from 'relay-runtime/lib/RelayStoreProxyDebugger';
import {addGitHubRepoUpdater} from 'universal/mutations/AddGitHubRepoMutation';

const subscription = graphql`
  subscription GitHubRepoAddedSubscription($teamId: ID!) {
    githubRepoAdded(teamId: $teamId) {
      repo {
        id
        adminUserId
        nameWithOwner
        teamMembers {
          id
          preferredName
          picture
        }
      }
    }
  }
`;

const GitHubRepoAddedSubscription = (environment, queryVariables) => {
  const {viewerId} = environment;
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const newNode = store.getRootField('githubRepoAdded').getLinkedRecord('repo');
      addGitHubRepoUpdater(store, viewerId, teamId, newNode);
    }
  };
};

export default GitHubRepoAddedSubscription;
