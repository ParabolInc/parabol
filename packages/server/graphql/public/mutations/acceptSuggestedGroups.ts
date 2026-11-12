import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getPhase from '../../../utils/getPhase'
import getRedis from '../../../utils/getRedis'
import publish from '../../../utils/publish'
import acceptSuggestedGroupsForMeeting from '../../mutations/helpers/acceptSuggestedGroupsForMeeting'
import type {MutationResolvers} from '../resolverTypes'

const LOCK_TTL_MS = 30_000

const acceptSuggestedGroups: MutationResolvers['acceptSuggestedGroups'] = async (
  _source,
  {meetingId},
  {dataLoader, socketId: mutatorId}
) => {
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting || meeting.meetingType !== 'retrospective') {
    throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  }
  if (meeting.endedAt) {
    throw new GraphQLError('The meeting has ended', {extensions: {code: 'CONFLICT'}})
  }
  if (getPhase(meeting.phases, 'group')?.stages[0]?.isComplete) {
    throw new GraphQLError('Groups are locked once voting starts', {extensions: {code: 'CONFLICT'}})
  }

  // Shared with generateSuggestedGroups and refreshSuggestedGroups, so the set being applied
  // cannot be replaced mid-apply
  const redis = getRedis()
  const lockKey = `lock:suggestedGrouping:${meetingId}`
  const hasLock = await redis.set(lockKey, 'accept', 'PX', LOCK_TTL_MS, 'NX')
  if (!hasLock) {
    throw new GraphQLError('Suggestions are being updated. Try again in a moment.', {
      extensions: {code: 'CONFLICT'}
    })
  }

  try {
    const acceptedCount = await acceptSuggestedGroupsForMeeting(meetingId, dataLoader)
    if (acceptedCount === 0) {
      throw new GraphQLError("There's nothing left to accept", {extensions: {code: 'CONFLICT'}})
    }
    const data = {meetingId, acceptedCount}
    const operationId = dataLoader.share()
    publish(SubscriptionChannel.MEETING, meetingId, 'AcceptSuggestedGroupsSuccess', data, {
      operationId,
      mutatorId
    })
    return data
  } finally {
    await redis.del(lockKey)
  }
}

export default acceptSuggestedGroups
