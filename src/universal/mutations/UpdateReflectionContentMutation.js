/**
 * Updates a reflection's content for the retrospective meeting.
 *
 * @flow
 */
import {commitMutation} from 'react-relay';
import type {CompletedHandler, ErrorHandler} from 'universal/types/relay';
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord';

type Variables = {
  content: string,
  reflectionId: string
};

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

const CreateReflectionMutation = (
  environment: Object,
  variables: Variables,
  onError?: ErrorHandler,
  onCompleted?: CompletedHandler
) => {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {reflectionId, content} = variables;
      const reflectionProxy = store.get(reflectionId);
      const nowISO = new Date().toJSON();
      const optimisticReflection = {
        content,
        updatedAt: nowISO
      };
      updateProxyRecord(reflectionProxy, optimisticReflection);
    }
  });
};

export default CreateReflectionMutation;
