import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {ResetReflectionGroupsMutation as TResetReflectionGroupsMutation} from '../__generated__/ResetReflectionGroupsMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

graphql`
  fragment ResetReflectionGroupsMutation_meeting on ResetReflectionGroupsSuccess {
    meeting {
      id
      ...GroupingKanban_meeting
      resetReflectionGroups {
        groupTitle
      }
      reflectionGroups {
        id
        title
        titleIsUserDefined
        sortOrder
        promptId
        reflections {
          id
          plaintextContent
          reflectionGroupId
          sortOrder
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
      ...ResetReflectionGroupsMutation_meeting @relay(mask: false) @alias
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
