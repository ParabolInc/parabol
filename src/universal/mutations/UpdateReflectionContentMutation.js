/**
 * Updates a reflection's content for the retrospective meeting.
 *
 * @flow
 */
import {commitMutation} from 'react-relay';
import {Environment, RecordSourceProxy, RecordSourceSelectorProxy} from 'relay-runtime';
import {maybe} from 'maeby';

import fmap2 from 'universal/utils/fmap2';

type Variables = {
  content: string,
  reflectionId: string
};

type CompletedHandler = (response: ?Object, errors: ?Array<Error>) => void;

type ErrorHandler = (error: Error) => void;

graphql`
  fragment UpdateReflectionContentMutation_team on UpdateReflectionContentPayload {
    meeting {
      id
    }
    reflection {
      id
      content
    }
  }
`;

const mutation = graphql`
  mutation UpdateReflectionContentMutation($content: String!, $reflectionId: ID!) {
    updateReflectionContent(content: $content, reflectionId: $reflectionId) {
      ...UpdateReflectionContentMutation_team @relay(mask: false)
    }
  }
`;

export const updateReflectionContentUpdater = (payload: ?RecordSourceProxy, store: RecordSourceSelectorProxy) => {
  const maybeReflections = maybe(payload)
    .bind((pl) => pl.getLinkedRecord('meeting'))
    .bind((payloadMeeting) => payloadMeeting.getValue('id'))
    .bind((meetingId) => store.get(meetingId))
    .bind((meeting) => meeting.getLinkedRecords('reflections'));
  const maybeReflection = maybe(payload)
    .bind((pl) => pl.getLinkedRecord('reflection'));
  const maybeReflectionId = maybeReflection
    .bind((reflection) => reflection.getValue('id'));
  const maybeReflectionContent = maybeReflection
    .bind((reflection) => reflection.getValue('content'));
  const maybeReflectionToUpdate = fmap2((reflections, reflectionId) => (
    reflections.find((r) => r.getValue('id') === reflectionId)
  ), maybeReflections, maybeReflectionId);

  fmap2((reflectionToUpdate, reflectionContent) => {
    reflectionToUpdate.setValue('content', reflectionContent);
  }, maybeReflectionToUpdate, maybeReflectionContent);
};

const getOptimisticResponse = (variables: Variables, meetingId: string) => ({
  updateReflectionContent: {
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
      const payload = store.getRootField('updateReflectionContent');
      updateReflectionContentUpdater(payload, store);
    }
  });
};

export default CreateReflectionMutation;
