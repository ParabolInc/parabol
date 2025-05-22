import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

const setMeetingMusic: MutationResolvers['setMeetingMusic'] = async (
  _source,
  {meetingId, trackSrc, isPlaying, timestamp},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)

  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  const data = {
    meetingId,
    trackSrc: trackSrc || null,
    isPlaying: !!isPlaying,
    timestamp: timestamp || null
  }

  publish(SubscriptionChannel.MEETING, meetingId, 'SetMeetingMusicSuccess', data, subOptions)

  return data
}

export default setMeetingMusic
