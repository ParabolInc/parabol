import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

const setMeetingMusic: MutationResolvers['setMeetingMusic'] = async (
  _source,
  {meetingId, trackSrc, isPlaying, timestamp},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  const data = {
    meetingId,
    trackSrc,
    isPlaying,
    timestamp
  }

  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  publish(SubscriptionChannel.MEETING, meetingId, 'SetMeetingMusicPayload', data, subOptions)
  return data
}

export default setMeetingMusic
