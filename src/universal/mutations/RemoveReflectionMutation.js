/**
 * Removes a reflection for the retrospective meeting.
 *
 */
import type {CompletedHandler, ErrorHandler} from 'universal/types/relay';
import {commitMutation} from 'react-relay';
import getInProxy from 'universal/utils/relay/getInProxy';
import handleRemoveReflections from 'universal/mutations/handlers/handleRemoveReflections';

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
  const reflectionId = getInProxy(payload, 'reflection', 'id');
  const meetingId = getInProxy(payload, 'meeting', 'id');
  handleRemoveReflections(reflectionId, meetingId, store);
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
      handleRemoveReflections(reflectionId, meetingId, store);
    },
    onCompleted,
    onError
  });
};

export default RemoveReflectionMutation;
