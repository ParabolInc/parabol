import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const setMeetingMusic: MutationResolvers['setMeetingMusic'] = async (
  _source,
  {meetingId, trackSrc, isPlaying},
  {dataLoader, authToken, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  const data = {
    meetingId,
    trackSrc: trackSrc || null,
    isPlaying: !!isPlaying
  }

  const track = trackSrc ? trackSrc.split('/').pop()?.replace('.mp3', '') : null
  if (track) {
    const user = await dataLoader.get('users').loadNonNull(viewerId)
    if (isPlaying) {
      analytics.musicPlayed(user, {
        meetingId,
        trackName: track,
        isFacilitator: true
      })
    } else {
      analytics.musicStopped(user, {
        meetingId,
        trackName: track,
        isFacilitator: true
      })
    }
  }

  publish(SubscriptionChannel.MEETING, meetingId, 'SetMeetingMusicSuccess', data, subOptions)

  return data
}

export default setMeetingMusic
