import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {AddTranscriptionBotMutation as TAddTranscriptionBotMutation} from '../__generated__/AddTranscriptionBotMutation.graphql'

graphql`
  fragment AddTranscriptionBotMutation_settings on AddTranscriptionBotSuccess {
    meetingSettings {
      ... on RetrospectiveMeetingSettings {
        videoMeetingURL
      }
    }
  }
`

const mutation = graphql`
  mutation AddTranscriptionBotMutation($teamId: ID!, $videoMeetingURL: String!) {
    addTranscriptionBot(teamId: $teamId, videoMeetingURL: $videoMeetingURL) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...AddTranscriptionBotMutation_settings @relay(mask: false)
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
