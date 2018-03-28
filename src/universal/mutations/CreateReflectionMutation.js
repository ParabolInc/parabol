/**
 * Creates a reflection for the retrospective meeting.
 *
 * @flow
 */
import {commitMutation} from 'react-relay';
import handleCreateReflections from 'universal/mutations/handlers/handleCreateReflections';
import clientTempId from 'universal/utils/relay/clientTempId';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';
import makeEmptyStr from 'universal/utils/draftjs/makeEmptyStr';

graphql`
  fragment CreateReflectionMutation_team on CreateReflectionPayload {
    meeting {
      id
    }
    reflection {
      content
      id
      isViewerCreator
      retroPhaseItemId
      sortOrder
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
  const reflection = payload.getLinkedRecord('reflection');
  handleCreateReflections(reflection, store);
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
        sortOrder: input.sortOrder,
        updatedAt: nowISO
      };
      const reflectionNode = createProxyRecord(store, 'RetroReflection', optimisticReflection);
      reflectionNode.setLinkedRecord(store.get(meetingId), 'meeting');
      handleCreateReflections(reflectionNode, store);
    }
  });
};

export default CreateReflectionMutation;
