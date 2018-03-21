/**
 * Creates a reflection for the retrospective meeting.
 *
 * @flow
 */
import {ContentState} from 'draft-js';
import {commitMutation} from 'react-relay';
import {Environment, RecordSourceSelectorProxy} from 'relay-runtime';

import clientTempId from 'universal/utils/relay/clientTempId';

type Variables = {
  content?: string,
  meetingId: string,
  retroPhaseItemId: string,
  sortOrder: number
};

type CompletedHandler = (response: ?Object, errors: ?Array<Error>) => void;

type ErrorHandler = (error: Error) => void;

const mutation = graphql`
  mutation CreateReflectionMutation($content: String, $meetingId: ID!, $retroPhaseItemId: ID!, $sortOrder: Float!) {
    createReflection(content: $content, meetingId: $meetingId, retroPhaseItemId: $retroPhaseItemId, sortOrder: $sortOrder) {
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
  }
`;

const createReflectionUpdater = (store: RecordSourceSelectorProxy) => {
  const payload = store.getRootField('createReflection');
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
      content: JSON.stringify(ContentState.createFromText('')),
      ...variables
    },
    onCompleted,
    onError,
    optimisticResponse: getOptimisticResponse(variables),
    updater: createReflectionUpdater
  });
};

export default CreateReflectionMutation;
