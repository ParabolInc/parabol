import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {Environment} from 'relay-runtime'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment SetMeetingMusicMutation_meeting on SetMeetingMusicSuccess {
    meetingId
    trackSrc
    isPlaying
    timestamp
  }
`

const mutation = graphql`
  mutation SetMeetingMusicMutation(
    $meetingId: ID!
    $trackSrc: String
    $isPlaying: Boolean!
    $timestamp: Float
  ) {
    setMeetingMusic(
      meetingId: $meetingId
      trackSrc: $trackSrc
      isPlaying: $isPlaying
      timestamp: $timestamp
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...SetMeetingMusicMutation_meeting @relay(mask: false)
    }
  }
`

const SetMeetingMusicMutation: StandardMutation<any> = (
  atmosphere: Environment,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<any>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default SetMeetingMusicMutation
