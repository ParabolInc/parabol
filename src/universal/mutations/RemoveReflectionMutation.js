/**
 * Removes a reflection for the retrospective meeting.
 *
 * @flow
 */
import type {CompletedHandler, ErrorHandler} from 'universal/types/relay';

import {commitMutation} from 'react-relay';
import {Environment, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime';

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

export const removeReflectionUpdater = (payload: RecordProxy, store: RecordSourceSelectorProxy) => {
  // TODO - maeby https://github.com/dan-f/maeby
  if (!payload) {
    return;
  }
  const payloadMeeting = payload.getLinkedRecord('meeting');
  if (!payloadMeeting) {
    return;
  }
  const meetingId = payloadMeeting.getValue('id');
  const reflection = payload.getLinkedRecord('reflection');
  if (!reflection) {
    return;
  }
  const meeting = store.get(meetingId);
  if (!meeting) {
    return;
  }
  const reflections = meeting.getLinkedRecords('reflections');
  if (!reflections) {
    return;
  }
  const newReflections = reflections.filter((r) => (
    r.getValue('id') !== reflection.getValue('id')
  ));
  meeting.setLinkedRecords(newReflections, 'reflections');
};

const getOptimisticResponse = (variables: Variables, meetingId: string) => ({
  removeReflection: {
    meeting: {
      __typename: 'RetrospectiveMeeting',
      id: meetingId
    },
    reflection: variables
  }
});

const CreateReflectionMutation = (
  environment: Environment,
  variables: Variables,
  meetingId: string,
  onError?: ErrorHandler,
  onCompleted?: CompletedHandler
) => {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticResponse: getOptimisticResponse(variables, meetingId),
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('removeReflection');
      removeReflectionUpdater(payload, store);
    }
  });
};

export default CreateReflectionMutation;
