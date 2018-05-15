/**
 * Updates a reflection's title for the retrospective meeting.
 *
 * @flow
 */
import {commitMutation} from 'react-relay'
import type {CompletedHandler, ErrorHandler} from 'universal/types/relay'
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord'

type Variables = {
  title: string,
  reflectionGroupId: string
}

graphql`
  fragment UpdateReflectionGroupTitleMutation_team on UpdateReflectionGroupTitlePayload {
    reflectionGroup {
      title
    }
  }
`

const mutation = graphql`
  mutation UpdateReflectionGroupTitleMutation($title: String!, $reflectionGroupId: ID!) {
    updateReflectionGroupTitle(title: $title, reflectionGroupId: $reflectionGroupId) {
      ...UpdateReflectionGroupTitleMutation_team @relay(mask: false)
    }
  }
`

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
      const {reflectionGroupId, title} = variables
      const reflectionGroupProxy = store.get(reflectionGroupId)
      const nowISO = new Date().toJSON()
      const optimisticReflection = {
        title,
        updatedAt: nowISO
      }
      updateProxyRecord(reflectionGroupProxy, optimisticReflection)
    }
  })
}

export default CreateReflectionMutation
