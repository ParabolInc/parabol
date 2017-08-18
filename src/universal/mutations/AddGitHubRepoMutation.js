import {commitMutation} from 'react-relay';
import {GITHUB} from 'universal/utils/constants';
import getOptimisticTeamMember from 'universal/utils/relay/getOptimisticTeamMember';
import {insertNodeBefore} from 'universal/utils/relay/insertEdge';
import incrementIntegrationCount from 'universal/utils/relay/incrementIntegrationCount';

const mutation = graphql`
  mutation AddGitHubRepoMutation($nameWithOwner: String!, $teamId: ID!) {
    addGitHubRepo(nameWithOwner: $nameWithOwner, teamId: $teamId) {
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

let tempId = 0;

export const addGitHubRepoUpdater = (store, viewerId, teamId, newNode) => {
  // update the integration list
  const viewer = store.get(viewerId);
  const githubRepos = viewer.getLinkedRecords('githubRepos', {teamId});
  if (githubRepos) {
    const newNodes = insertNodeBefore(githubRepos, newNode, 'nameWithOwner');
    viewer.setLinkedRecords(newNodes, 'githubRepos', {teamId});
  }

  incrementIntegrationCount(viewer, teamId, GITHUB, 1);
};

const AddGitHubRepoMutation = (environment, nameWithOwner, teamId, onError, onCompleted) => {
  const {viewerId} = environment;
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
