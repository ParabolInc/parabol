/**
 * Removes a reflection for the retrospective meeting.
 *
 */
import type {CompletedHandler, ErrorHandler} from 'universal/types/relay';
import {commitMutation} from 'react-relay';
import getInProxy from 'universal/utils/relay/getInProxy';
import handleRemoveReflectionGroups from 'universal/mutations/handlers/handleRemoveReflectionGroups';

type Context = {
  meetingId: string
};

type Variables = {
  reflectionId: string,
};

graphql`
  fragment RemoveReflectionMutation_team on RemoveReflectionPayload {
    meeting {
      id
    }
    reflection {
      id
      reflectionGroupId
    }
    unlockedStages {
      id
      isNavigableByFacilitator
    }
  }
`;

const mutation = graphql`
  mutation RemoveReflectionMutation($reflectionId: ID!) {
    removeReflection(reflectionId: $reflectionId) {
      ...RemoveReflectionMutation_team @relay(mask: false)
    }
  }
`;

export const removeReflectionTeamUpdater = (payload, store) => {
  const meetingId = getInProxy(payload, 'meeting', 'id');
  const reflectionGroupId = getInProxy(payload, 'reflection', 'reflectionGroupId');
  handleRemoveReflectionGroups(reflectionGroupId, meetingId, store);
};

const RemoveReflectionMutation = (environment: Object,
  variables: Variables,
  context: Context,
  onError?: ErrorHandler,
  onCompleted?: CompletedHandler) => {
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('removeReflection');
      if (!payload) return;
      removeReflectionTeamUpdater(payload, store);
    },
    optimisticUpdater: (store) => {
      const {reflectionId} = variables;
      const {meetingId} = context;
      const reflection = store.get(reflectionId);
      if (!reflection) return;
      const reflectionGroupId = reflection.getValue('reflectionGroupId');
      handleRemoveReflectionGroups(reflectionGroupId, meetingId, store);
    },
    onCompleted,
    onError
  });
};

export default RemoveReflectionMutation;
