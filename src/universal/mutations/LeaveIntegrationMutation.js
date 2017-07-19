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

export const leaveIntegrationUpdater = (store, viewer, teamId, payload) => {
  const integrationId = payload.getValue('integrationId');
  const userId = payload.getValue('userId');
  const {type, id} = fromGlobalId(integrationId);
  if (!userId) {
    if (type === GITHUB) {
      removeGitHubRepoUpdater(viewer, teamId, integrationId);
    }
  } else {
    const integration = store.get(integrationId);
    if (integration) {
      const teamMembers = integration.getLinkedRecords('teamMembers');
      const teamMemberId = `${userId}::${teamId}`;
      const newNodes = getArrayWithoutIds(teamMembers, teamMemberId);
      integration.setLinkedRecords(newNodes, 'teamMembers');
    }
  }

};

let tempId = 0;
const LeaveIntegrationMutation = (environment, globalId, teamId, viewerId) => {
  return commitMutation(environment, {
    mutation,
    variables: {globalId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('leaveIntegration');
      leaveIntegrationUpdater(store, viewer, teamId, payload);
    },
    optimisticUpdater: (store) => {
      const {id: userId} = fromGlobalId(viewerId);
      const leaveIntegration = store.create(`client:leaveIntegration:${tempId++}`, 'LeaveIntegrationPayload');
      leaveIntegration.setValue(userId, 'userId');
      leaveIntegration.setValue(globalId, 'integrationId');
      const viewer = store.get(viewerId);
      leaveIntegrationUpdater(store, viewer, teamId, leaveIntegration);
    },
    onError: (err) => {
      console.log('err', err);
    }
  });
};

export default LeaveIntegrationMutation;
