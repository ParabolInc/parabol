import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpdateMeetingPromptMutation as TUpdateMeetingPromptMutation} from '../__generated__/UpdateMeetingPromptMutation.graphql'

graphql`
  fragment UpdateMeetingPromptMutation_meeting on UpdateMeetingPromptSuccess {
    meeting {
      id
      meetingPrompt
    }
  }
`

const mutation = graphql`
  mutation UpdateMeetingPromptMutation($meetingId: ID!, $newPrompt: String!) @raw_response_type {
    updateMeetingPrompt(meetingId: $meetingId, newPrompt: $newPrompt) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateMeetingPromptMutation_meeting @relay(mask: false)
    }
  }
`

const UpdateMeetingPromptMutation: StandardMutation<TUpdateMeetingPromptMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateMeetingPromptMutation>(atmosphere, {
    mutation,
    variables,
    optimisticResponse: {
      updateMeetingPrompt: {
        __typename: 'UpdateMeetingPromptSuccess',
        meeting: {
          id: variables.meetingId,
          meetingPrompt: variables.newPrompt
        }
      }
    },
    onCompleted,
    onError
  })
}

export default UpdateMeetingPromptMutation
