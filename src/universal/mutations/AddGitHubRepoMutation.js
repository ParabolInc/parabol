import {commitMutation} from 'react-relay';
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
  const viewer = store.get(viewerId);
  const githubRepos = viewer.getLinkedRecords('githubRepos', {teamId});
  const newNodes = insertNodeBefore(githubRepos, newNode, 'nameWithOwner');
  viewer.setLinkedRecords(newNodes, 'githubRepos', {teamId});
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
      const teamMemberNode = store.create(`client:users:${tempId++}`, 'User');
      // TODO use real values
      teamMemberNode.setValue(null, 'picture');
      teamMemberNode.setValue('Me', 'preferredName');
      teamMemberNode.setValue(`client:userId:${tempId++}`, 'id');
      const node = store.create(`client:repo:${tempId++}`, 'GitHubIntegration');
      node.setValue(nameWithOwner, 'nameWithOwner');
      node.setLinkedRecords([teamMemberNode], 'teamMembers');
      addGitHubRepoUpdater(store, viewerId, teamId, node);
    },
    onCompleted,
    onError
  });
};

export default AddGitHubRepoMutation;
