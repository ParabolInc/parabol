import {commitMutation} from 'react-relay';
import {removeGitHubRepoUpdater} from 'universal/mutations/RemoveGitHubRepoMutation';
import {GITHUB} from 'universal/utils/constants';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';
import getArrayWithoutIds from 'universal/utils/relay/getArrayWithoutIds';

const mutation = graphql`
  mutation LeaveIntegrationMutation($globalId: ID!) {
    leaveIntegration(globalId: $globalId) {
      integrationId
      userId
    }
  }
`;

export const leaveIntegrationUpdater = (viewer, teamId, payload) => {
  const integrationId = payload.getValue('integrationId');
  const userId = payload.getValue('userId');
  const {type, id} = fromGlobalId(integrationId);
  if (type === GITHUB) {
    if (!userId) {
      removeGitHubRepoUpdater(viewer, teamId, integrationId);
    } else {
      const githubRepos = viewer.getLinkedRecords('githubRepos', {teamId});
      if (githubRepos) {
        const newNodes = getArrayWithoutIds(githubRepos, deletedId);

      }
    }
  } else {

  }

  viewer.setLinkedRecords(newNodes, 'githubRepos', {teamId});
};

const LeaveIntegrationMutation = (environment, githubGlobalId, teamId, viewerId) => {
  return commitMutation(environment, {
    mutation,
    variables: {githubGlobalId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('leaveIntegration');
      leaveIntegrationUpdater(viewer, teamId, payload);
    },
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId);
      leaveIntegrationUpdater(viewer, teamId, githubGlobalId);
    },
    onError: (err) => {
      console.log('err', err);
    }
  });
};

export default LeaveIntegrationMutation;
