/**
 * Updates the editing state of a retrospective reflection.
 *
 * @flow
 */
import {commitMutation} from 'react-relay';
import {Environment, RecordSourceProxy, RecordSourceSelectorProxy} from 'relay-runtime';

type Variables = {
  isEditing: boolean,
  reflectionId: string
};

type CompletedHandler = (response: ?Object, errors: ?Array<Error>) => void;

type ErrorHandler = (error: Error) => void;

graphql`
  fragment UpdateReflectionIsEditingMutation_team on UpdateReflectionIsEditingPayload {
    meeting {
      id
    }
    reflection {
      id
      isEditing
    }
  }
`;

const mutation = graphql`
  mutation UpdateReflectionIsEditingMutation($reflectionId: ID!, $isEditing: Boolean!) {
    updateReflectionIsEditing(reflectionId: $reflectionId, isEditing: $isEditing) {
      ...UpdateReflectionIsEditingMutation_team @relay(mask: false)
    }
  }
`;

const getOptimisticResponse = (variables: Variables, meetingId: string) => ({
  updateReflectionIsEditing: {
    meeting: {
      __typename: 'RetrospectiveMeeting',
      id: meetingId
    },
    reflection: variables
  }
});

export const updateReflectionIsEditingUpdater = (payload: ?RecordSourceProxy, store: RecordSourceSelectorProxy) => {
  if (!payload) {
    return;
  }
  const reflection = payload.getLinkedRecord('reflection');
  if (!reflection) {
    return;
  }
  const reflectionId = reflection.getValue('id');
  const reflectionIsEditing = reflection.getValue('isEditing');
  const payloadMeeting = payload.getLinkedRecord('meeting');
  if (!payloadMeeting) {
    return;
  }
  const meetingId = payloadMeeting.getValue('id');
  const meeting = store.get(meetingId);
  if (!meeting) {
    return;
  }
  const reflections = meeting.getLinkedRecords('reflections');
  if (!reflections) {
    return;
  }
  const reflectionToUpdate = reflections.find((r) => r.getValue('id') === reflectionId);
  if (!reflectionToUpdate) {
    return;
  }
  reflectionToUpdate.setValue(reflectionIsEditing, 'isEditing');
};

const UpdateReflectionIsEditingMutation = (
  environment: Environment,
  variables: Variables,
  meetingId: string,
  onError?: ErrorHandler,
  onCompleted?: CompletedHandler
) => (
  commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticResponse: getOptimisticResponse(variables, meetingId),
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('updateReflectionIsEditing');
      updateReflectionIsEditingUpdater(payload, store);
    }
  })
);

export default UpdateReflectionIsEditingMutation;
