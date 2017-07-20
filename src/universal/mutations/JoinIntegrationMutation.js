import {commitMutation} from 'react-relay';
import getOptimisticTeamMember from 'universal/utils/relay/getOptimisticTeamMember';

const mutation = graphql`
  mutation JoinIntegrationMutation($globalId: ID!) {
    joinIntegration(globalId: $globalId) {
      globalId
      teamMember {
        id
        picture
        preferredName
      }
    }
  }
`;

export const joinIntegrationUpdater = (store, viewer, teamId, payload) => {
  const globalId = payload.getValue('globalId');
  const integration = store.get(globalId);
  if (!integration) return;
  const teamMembers = integration.getLinkedRecords('teamMembers');
  teamMembers.push(payload.getLinkedRecord('teamMember'));
  integration.setLinkedRecords(teamMembers, 'teamMembers');
};

let tempId = 0;
const JoinIntegrationMutation = (environment, globalId, teamId, viewerId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {globalId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('joinIntegration');
      joinIntegrationUpdater(store, viewer, teamId, payload);
    },
    optimisticUpdater: (store) => {
      const teamMemberNode = getOptimisticTeamMember(store, viewerId, teamId);
      const payload = store.create(`client:joinIntegration:${tempId++}`, 'JoinIntegrationPayload')
        .setValue(globalId, 'globalId')
        .setLinkedRecord(teamMemberNode, 'teamMember');
      const viewer = store.get(viewerId);
      joinIntegrationUpdater(store, viewer, teamId, payload);
    },
    onError,
    onCompleted
  });
};

export default JoinIntegrationMutation;
