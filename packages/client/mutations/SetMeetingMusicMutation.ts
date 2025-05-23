import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {Environment} from 'relay-runtime'
import {SetMeetingMusicMutation as TSetMeetingMusicMutation} from '../__generated__/SetMeetingMusicMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

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

graphql`
  fragment SetMeetingMusicMutation_meeting on SetMeetingMusicSuccess {
    meetingId
    trackSrc
    isPlaying
    timestamp
  }
`

const SetMeetingMusicMutation: StandardMutation<TSetMeetingMusicMutation> = (
  atmosphere: Environment,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSetMeetingMusicMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {meetingId, trackSrc, isPlaying} = variables

      const meeting = store.get(meetingId)
      if (!meeting) return

      let musicSettings = meeting.getLinkedRecord('musicSettings')
      if (!musicSettings) {
        musicSettings = store.create(meetingId + '.musicSettings', 'MusicSettings')
        meeting.setLinkedRecord(musicSettings, 'musicSettings')
      }

      musicSettings.setValue(trackSrc, 'trackSrc')
      musicSettings.setValue(isPlaying, 'isPlaying')
      musicSettings.setValue(variables.timestamp, 'timestamp')
    }
  })
}

export default SetMeetingMusicMutation
