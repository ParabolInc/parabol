/**
 * Updates a reflection's content for the retrospective meeting.
 *
 */
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import updateProxyRecord from '../utils/relay/updateProxyRecord'
import {StandardMutation} from '../types/relayMutations'
import {UpdateReflectionAnonymityMutation as TUpdateReflectionAnonymityMutation} from '../__generated__/UpdateReflectionAnonymityMutation.graphql'

graphql`
  fragment UpdateReflectionAnonymityMutation_meeting on UpdateReflectionAnonymityPayload {
    reflection {
      isAnonymous
    }
  }
`

const mutation = graphql`
  mutation UpdateReflectionAnonymityMutation($isAnonymous: Boolean!, $reflectionId: ID!) {
    updateReflectionAnonymity(isAnonymous: $isAnonymous, reflectionId: $reflectionId) {
      error {
        message
      }
      ...UpdateReflectionAnonymityMutation_meeting @relay(mask: false)
    }
  }
`

const UpdateReflectionAnonymityMutation: StandardMutation<TUpdateReflectionAnonymityMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {reflectionId, isAnonymous} = variables
      const reflectionProxy = store.get(reflectionId)
      const nowISO = new Date().toJSON()
      const optimisticReflection = {
        isAnonymous,
        updatedAt: nowISO
      }
      updateProxyRecord(reflectionProxy, optimisticReflection)
    }
  })
}

export default UpdateReflectionAnonymityMutation
