import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {UngroupReflectionMutation as TUngroupReflectionMutation} from '../__generated__/UngroupReflectionMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

graphql`
  fragment UngroupReflectionMutation_meeting on UngroupReflectionSuccess {
    meeting {
      id
      ...GroupingKanban_meeting
    }
  }
`

const mutation = graphql`
  mutation UngroupReflectionMutation($reflectionGroupId: ID, $reflectionId: ID) {
    ungroupReflection(reflectionGroupId: $reflectionGroupId, reflectionId: $reflectionId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UngroupReflectionMutation_meeting @relay(mask: false)
    }
  }
`

const UngroupReflectionMutation: StandardMutation<TUngroupReflectionMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUngroupReflectionMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default UngroupReflectionMutation
