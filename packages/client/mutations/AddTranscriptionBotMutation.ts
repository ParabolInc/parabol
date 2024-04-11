import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {AddTranscriptionBotMutation as TAddTranscriptionBotMutation} from '../__generated__/AddTranscriptionBotMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment AddTranscriptionBotMutation_meeting on AddTranscriptionBotSuccess {
    meeting {
      videoMeetingURL
    }
  }
`

const mutation = graphql`
  mutation AddTranscriptionBotMutation($meetingId: ID!, $videoMeetingURL: String!) {
    addTranscriptionBot(meetingId: $meetingId, videoMeetingURL: $videoMeetingURL) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...AddTranscriptionBotMutation_meeting @relay(mask: false)
    }
  }
`

const AddTranscriptionBotMutation: StandardMutation<TAddTranscriptionBotMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddTranscriptionBotMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddTranscriptionBotMutation
