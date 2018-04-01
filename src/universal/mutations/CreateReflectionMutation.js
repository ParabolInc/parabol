/**
 * Creates a reflection for the retrospective meeting.
 *
 */
import {commitMutation} from 'react-relay';
import handleAddReflectionGroups from 'universal/mutations/handlers/handleAddReflectionGroups';
import clientTempId from 'universal/utils/relay/clientTempId';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';
import makeEmptyStr from 'universal/utils/draftjs/makeEmptyStr';

graphql`
  fragment CreateReflectionMutation_team on CreateReflectionPayload {
    reflectionGroup {
      meetingId
      sortOrder
      retroPhaseItemId
      reflections {
        ...CompleteReflectionFrag@relay(mask: false)
      }
    }
  }
`;

const mutation = graphql`
  mutation CreateReflectionMutation($input: CreateReflectionInput!) {
    createReflection(input: $input) {
      ...CreateReflectionMutation_team @relay(mask: false)
    }
  }
`;

export const createReflectionTeamUpdater = (payload, store) => {
  const reflectionGroup = payload.getLinkedRecord('reflectionGroup');
  handleAddReflectionGroups(reflectionGroup, store);
};

const CreateReflectionMutation = (atmosphere, variables, context, onError, onCompleted) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('createReflection');
      if (!payload) return;
      createReflectionTeamUpdater(payload, store);
    },
    optimisticUpdater: (store) => {
      const {input} = variables;
      const {viewerId} = atmosphere;
      const {meetingId} = context;
      const nowISO = new Date().toJSON();
      const optimisticReflection = {
        id: clientTempId(),
        content: input.content || makeEmptyStr(),
        createdAt: nowISO,
        creatorId: viewerId,
        isActive: true,
        isEditing: true,
        isViewerCreator: true,
        meetingId,
        retroPhaseItemId: input.retroPhaseItemId,
        sortOrder: 0,
        updatedAt: nowISO
      };
      const optimisticGroup = {
        id: clientTempId(),
        createdAt: nowISO,
        isActive: true,
        meetingId,
        retroPhaseItemId: input.retroPhaseItemId,
        sortOrder: input.sortOrder,
        updatedAt: nowISO
      };
      const meeting = store.get(meetingId);
      const reflectionNode = createProxyRecord(store, 'RetroReflection', optimisticReflection);
      reflectionNode.setLinkedRecord(meeting, 'meeting');
      const reflectionGroupNode = createProxyRecord(store, 'RetroReflectionGroup', optimisticGroup);
      reflectionGroupNode.setLinkedRecords([reflectionNode], 'reflections');
      reflectionGroupNode.setLinkedRecord(meeting, 'meeting');
      handleAddReflectionGroups(reflectionGroupNode, store);
    }
  });
};

export default CreateReflectionMutation;
