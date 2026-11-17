import {SubscriptionChannel} from '../../../../client/types/constEnums'
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

  publish(SubscriptionChannel.MEETING, meetingId, 'SetMeetingMusicSuccess', data, subOptions)

  return data
}

export default setMeetingMusic
