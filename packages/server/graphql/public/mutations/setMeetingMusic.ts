import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const setMeetingMusic: MutationResolvers['setMeetingMusic'] = async (
  _source,
  {meetingId, trackSrc, isPlaying},
  {dataLoader, authToken, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    return standardError(new Error('Meeting not found'))
  }
  const {facilitatorUserId} = meeting
  const viewerId = getUserId(authToken)
  if (viewerId !== facilitatorUserId) {
    return standardError(new Error('Only the facilitator can set the meeting music'))
  }

  const data = {
    meetingId,
    trackSrc: trackSrc || null,
    isPlaying: !!isPlaying
  }

  publish(SubscriptionChannel.MEETING, meetingId, 'SetMeetingMusicSuccess', data, subOptions)

  return data
}

export default setMeetingMusic
