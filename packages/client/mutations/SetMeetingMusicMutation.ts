import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SetMeetingMusicMutation as TSetMeetingMusicMutation} from '../__generated__/SetMeetingMusicMutation.graphql'
import {SetMeetingMusicMutation_meeting$data} from '../__generated__/SetMeetingMusicMutation_meeting.graphql'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'

const mutation = graphql`
  mutation SetMeetingMusicMutation($meetingId: ID!, $trackSrc: String, $isPlaying: Boolean!) {
    setMeetingMusic(meetingId: $meetingId, trackSrc: $trackSrc, isPlaying: $isPlaying) {
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
  }
`

export const setMeetingMusicMeetingUpdater: SharedUpdater<SetMeetingMusicMutation_meeting$data> = (
  payload,
  {store}
) => {
  const meetingId = payload.getValue('meetingId')
  const trackSrc = payload.getValue('trackSrc')
  const isPlaying = payload.getValue('isPlaying')

  const meeting = store.get(meetingId)
  if (!meeting) return

  const musicSettingsRecord = meeting.getLinkedRecord('musicSettings')
  if (!musicSettingsRecord) {
    const musicSettingsData = {
      trackSrc,
      isPlaying
    }
    const musicSettings = createProxyRecord(store, 'MusicSettings', musicSettingsData)
    meeting.setLinkedRecord(musicSettings, 'musicSettings')
  } else {
    musicSettingsRecord.setValue(trackSrc, 'trackSrc')
    musicSettingsRecord.setValue(isPlaying, 'isPlaying')
  }
}

const SetMeetingMusicMutation: StandardMutation<TSetMeetingMusicMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSetMeetingMusicMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('setMeetingMusic')
      setMeetingMusicMeetingUpdater(payload as any, {atmosphere, store})
    },
    onCompleted,
    onError
  })
}

export default SetMeetingMusicMutation
