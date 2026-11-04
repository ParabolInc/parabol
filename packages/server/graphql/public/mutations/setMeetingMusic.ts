import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {meetingMusicChanges} from '../../../metricsHandler'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const setMeetingMusic: MutationResolvers['setMeetingMusic'] = async (
  _source,
  {meetingId, trackSrc, isPlaying},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  const data = {
    meetingId,
    trackSrc: trackSrc || null,
    isPlaying: !!isPlaying
  }

  const track = trackSrc ? trackSrc.split('/').pop()?.replace('.mp3', '') : null
  if (track) {
    meetingMusicChanges.inc({change: isPlaying ? 'played' : 'stopped'})
  }

  publish(SubscriptionChannel.MEETING, meetingId, 'SetMeetingMusicSuccess', data, subOptions)

  return data
}

export default setMeetingMusic
