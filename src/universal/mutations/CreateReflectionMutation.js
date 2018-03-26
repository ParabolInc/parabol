/**
 * Creates a reflection for the retrospective meeting.
 *
 * @flow
 */
import type {CompletedHandler, ErrorHandler} from 'universal/types/relay';

import {maybe} from 'maeby';
import {commitMutation} from 'react-relay';
import {Environment, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime';

import makeEmptyStr from 'universal/utils/draftjs/makeEmptyStr';
import fmap3 from 'universal/utils/fmap3';
import clientTempId from 'universal/utils/relay/clientTempId';

type Variables = {
  content?: string,
  meetingId: string,
  retroPhaseItemId: string,
  sortOrder: number
};

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

export const createReflectionUpdater = (payload: ?RecordProxy, store: RecordSourceSelectorProxy) => {
  const maybeNewReflection = maybe(payload)
    .bind((pl) => pl.getLinkedRecord('reflection'));
  const maybeMeeting = maybe(payload)
    .bind((pl) => pl.getLinkedRecord('meeting'))
    .bind((payloadMeeting) => payloadMeeting.getValue('id'))
    .bind((meetingId) => store.get(meetingId));
  const maybeCurrentReflections = maybeMeeting
    .bind((meeting) => meeting.getLinkedRecords('reflections'));

  fmap3((currentReflections, newReflection, meeting) => {
    if (currentReflections.find((r) => r.getValue('id') === newReflection.getValue('id'))) {
      return;
    }
    const newReflections = [...currentReflections, newReflection].sort((a, b) => {
      const sortOrderA = a.getValue('sortOrder');
      const sortOrderB = b.getValue('sortOrder');
      return sortOrderA - sortOrderB;
    });
    meeting.setLinkedRecords(newReflections, 'reflections');
  }, maybeCurrentReflections, maybeNewReflection, maybeMeeting);
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
