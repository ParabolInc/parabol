/**
 * Updates the editing state of a retrospective reflection.
 *
 * @flow
 */
import type {CompletedHandler, ErrorHandler} from 'universal/types/relay';

import {maybe} from 'maeby';
import {commitMutation} from 'react-relay';
import {Environment, RecordSourceProxy, RecordSourceSelectorProxy} from 'relay-runtime';

import fmap2 from 'universal/utils/fmap2';

type Variables = {
  isEditing: boolean,
  reflectionId: string
};

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
  const maybeReflections = maybe(payload)
    .bind((pl) => pl.getLinkedRecord('meeting'))
    .bind((payloadMeeting) => payloadMeeting.getValue('id'))
    .bind((meetingId) => store.get(meetingId))
    .bind((meeting) => meeting.getLinkedRecords('reflections'));
  const maybeReflection = maybe(payload)
    .bind((pl) => pl.getLinkedRecord('reflection'));
  const maybeReflectionId = maybeReflection
    .bind((reflection) => reflection.getValue('id'));
  const maybeReflectionIsEditing = maybeReflection
    .bind((reflection) => reflection.getValue('isEditing'));
  const maybeReflectionToUpdate = fmap2((reflections, reflectionId) => (
    reflections.find((r) => r.getValue('id') === reflectionId)
  ), maybeReflections, maybeReflectionId);

  fmap2((reflectionToUpdate, reflectionContent) => {
    reflectionToUpdate.setValue('isEditing', reflectionContent);
  }, maybeReflectionToUpdate, maybeReflectionIsEditing);
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
