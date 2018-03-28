/**
 * Removes a reflection for the retrospective meeting.
 *
 */
import type {CompletedHandler, ErrorHandler} from 'universal/types/relay';

import {maybe} from 'maeby';
import {commitMutation} from 'react-relay';

import fmap3 from 'universal/utils/fmap3';

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
  const maybeMeeting = maybe(payload)
    .bind((pl) => pl.getLinkedRecord('meeting'))
    .bind((payloadMeeting) => payloadMeeting.getValue('id'))
    .bind((meetingId) => store.get(meetingId));
  const maybeReflections = maybeMeeting
    .bind((meeting) => meeting.getLinkedRecords('reflections'));
  const maybeReflection = maybe(payload)
    .bind((pl) => pl.getLinkedRecord('reflection'));

  fmap3((meeting, reflections, reflection) => {
    const newReflections = reflections.filter((r) => (
      r.getValue('id') !== reflection.getValue('id')
    ));
    meeting.setLinkedRecords(newReflections, 'reflections');
  }, maybeMeeting, maybeReflections, maybeReflection);
};

const CreateReflectionMutation = (
  environment: Object,
  variables: Variables,
  meetingId: string,
  onError?: ErrorHandler,
  onCompleted?: CompletedHandler
) => {
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('removeReflection');
      if (!payload) return;
      removeReflectionTeamUpdater(payload, store);
    },
    onCompleted,
    onError,
  });
};

export default CreateReflectionMutation;
