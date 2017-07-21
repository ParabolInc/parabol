import {commitMutation} from 'react-relay';
import {GITHUB} from 'universal/utils/constants';
import getOptimisticTeamMember from 'universal/utils/relay/getOptimisticTeamMember';
import {insertNodeBefore} from 'universal/utils/relay/insertEdge';

const mutation = graphql`
  mutation AddGitHubRepoMutation($nameWithOwner: String!, $teamId: ID!) {
    addGitHubRepo(nameWithOwner: $nameWithOwner, teamId: $teamId) {
      repo {
        id
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

let tempId = 0;

export const addGitHubRepoUpdater = (store, viewerId, teamId, newNode) => {
  // update the integration list
  const viewer = store.get(viewerId);
  const githubRepos = viewer.getLinkedRecords('githubRepos', {teamId});
  if (githubRepos) {
    const newNodes = insertNodeBefore(githubRepos, newNode, 'nameWithOwner');
    viewer.setLinkedRecords(newNodes, 'githubRepos', {teamId});
  }

  // update the providerMap
  const oldProviderMap = viewer.getLinkedRecord('providerMap', {teamId});
  if (oldProviderMap) {
    const oldProviderRow = oldProviderMap.getLinkedRecord(GITHUB);
    oldProviderRow.setValue(oldProviderRow.getValue('integrationCount') + 1, 'integrationCount');
  }
};

const AddGitHubRepoMutation = (environment, nameWithOwner, teamId, viewerId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {nameWithOwner, teamId},
    updater: (store) => {
      const node = store.getRootField('addGitHubRepo').getLinkedRecord('repo');
      addGitHubRepoUpdater(store, viewerId, teamId, node);
    },
    optimisticUpdater: (store) => {
      const teamMemberNode = getOptimisticTeamMember(store, viewerId, teamId);
      const repoId = `addGitHubRepo:${tempId++}`;
      const repo = store.create(repoId, GITHUB)
        .setValue(nameWithOwner, 'nameWithOwner')
        .setValue(repoId, 'id')
        .setLinkedRecords([teamMemberNode], 'teamMembers');
      addGitHubRepoUpdater(store, viewerId, teamId, repo);
    },
    onCompleted,
    onError
  });
};

export default AddGitHubRepoMutation;
