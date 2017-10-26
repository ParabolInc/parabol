import {commitMutation} from 'react-relay';
import {removeGitHubRepoUpdater} from 'universal/mutations/RemoveGitHubRepoMutation';
import {GITHUB} from 'universal/utils/constants';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';
import getArrayWithoutIds from 'universal/utils/relay/getArrayWithoutIds';
import toGlobalId from 'universal/utils/relay/toGlobalId';

const mutation = graphql`
  mutation LeaveIntegrationMutation($globalId: ID!) {
    leaveIntegration(globalId: $globalId) {
      globalId
      userId
    }
  }
`;

export const leaveIntegrationUpdater = (store, viewer, teamId, payload) => {
  const globalId = payload.getValue('globalId');
  const userId = payload.getValue('userId');
  const {type} = fromGlobalId(globalId);
  // a null userId is interpreted as removing the whole repo
  if (userId) {
    const integration = store.get(globalId);
    if (integration) {
      const teamMembers = integration.getLinkedRecords('teamMembers');
      if (teamMembers) {
        const teamMemberId = `${userId}::${teamId}`;
        const globalTeamMemberId = toGlobalId('TeamMember', teamMemberId);
        const newNodes = getArrayWithoutIds(teamMembers, globalTeamMemberId);
        integration.setLinkedRecords(newNodes, 'teamMembers');
      }
      // FIXME https://github.com/facebook/relay/issues/1963
      // const userIds = integration.getValue('userIds');
      // if (userIds) {
      // const newUserIds = userIds.filter((id) => id !== userId);
      // integration.setValue(newUserIds, 'userIds');
      // }
    }
  } else if (type === GITHUB) {
    removeGitHubRepoUpdater(viewer, teamId, globalId);
  }
};

let tempId = 0;
const LeaveIntegrationMutation = (environment, globalId, teamId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {globalId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('leaveIntegration');
      leaveIntegrationUpdater(store, viewer, teamId, payload);
    },
    optimisticUpdater: (store) => {
      const {userId} = environment;
      const leaveIntegration = store.create(`client:leaveIntegration:${tempId++}`, 'LeaveIntegrationPayload')
        .setValue(userId, 'userId')
        .setValue(globalId, 'globalId');
      const viewer = store.get(viewerId);
      leaveIntegrationUpdater(store, viewer, teamId, leaveIntegration);
    },
    onError,
    onCompleted
  });
};

export default LeaveIntegrationMutation;
