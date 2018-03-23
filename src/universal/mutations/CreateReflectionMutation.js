/**
 * Creates a reflection for the retrospective meeting.
 *
 * @flow
 */
import {commitMutation} from 'react-relay';
import {Environment, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime';

import clientTempId from 'universal/utils/relay/clientTempId';
import makeEmptyStr from 'universal/utils/draftjs/makeEmptyStr';

type Variables = {
  content?: string,
  meetingId: string,
  retroPhaseItemId: string,
  sortOrder: number
};

type CompletedHandler = (response: ?Object, errors: ?Array<Error>) => void;

type ErrorHandler = (error: Error) => void;

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
  mutation CreateReflectionMutation($content: String, $meetingId: ID!, $retroPhaseItemId: ID!, $sortOrder: Float!) {
    createReflection(content: $content, meetingId: $meetingId, retroPhaseItemId: $retroPhaseItemId, sortOrder: $sortOrder) {
      ...CreateReflectionMutation_team @relay(mask: false)
    }
  }
`;

export const createReflectionUpdater = (payload: RecordProxy, store: RecordSourceSelectorProxy) => {
  // TODO - https://github.com/dan-f/maeby
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
  if (reflections.find((r) => r.getValue('id') === reflection.getValue('id'))) {
    return;
  }
  const newReflections = [...reflections, reflection].sort((a, b) => {
    const sortOrderA = a.getValue('sortOrder');
    const sortOrderB = b.getValue('sortOrder');
    return sortOrderB - sortOrderA;
  });
  meeting.setLinkedRecords(newReflections, 'reflections');
};

const getOptimisticResponse = (variables: Variables) => ({
  createReflection: {
    error: null,
    meeting: null,
    reflection: {
      ...variables,
      id: clientTempId(),
      isViewerCreator: true
    }
  }
});

const CreateReflectionMutation = (
  environment: Environment,
  variables: Variables,
  onError?: ErrorHandler,
  onCompleted?: CompletedHandler
) => {
  return commitMutation(environment, {
    mutation,
    variables: {
      content: makeEmptyStr(),
      ...variables
    },
    onCompleted,
    onError,
    optimisticResponse: getOptimisticResponse(variables),
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('createReflection');
      createReflectionUpdater(payload, store);
    }
  });
};

export default CreateReflectionMutation;
