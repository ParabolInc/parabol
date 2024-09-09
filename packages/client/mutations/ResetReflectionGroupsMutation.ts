import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {ResetReflectionGroupsMutation as TResetReflectionGroupsMutation} from '../__generated__/ResetReflectionGroupsMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment ResetReflectionGroupsMutation_meeting on ResetReflectionGroupsSuccess {
    meeting {
      id
      resetReflectionGroups {
        groupTitle
      }
      reflectionGroups {
        id
        title
        promptId
        reflections {
          id
          plaintextContent
          reflectionGroupId
        }
      }
    }
  }
`

const mutation = graphql`
  mutation ResetReflectionGroupsMutation($meetingId: ID!) {
    resetReflectionGroups(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...ResetReflectionGroupsMutation_meeting @relay(mask: false)
    }
  }
`

const ResetReflectionGroupsMutation: StandardMutation<TResetReflectionGroupsMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TResetReflectionGroupsMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default ResetReflectionGroupsMutation
