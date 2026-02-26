import ms from 'ms'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import getRedis, {type RedisPipelineResponse} from '../../../utils/getRedis'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const pokerAnnounceDeckHover: MutationResolvers['pokerAnnounceDeckHover'] = async (
  _source,
  {meetingId, stageId, isHover},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    return {error: {message: 'Meeting not found'}}
  }
  if (meeting.meetingType !== 'poker') {
    return {error: {message: 'Not a poker meeting'}}
  }
  const {endedAt, phases, teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return {error: {message: 'Not on the team'}}
  }
  if (endedAt) {
    return {error: {message: 'Meeting has ended'}}
  }
  if (isPhaseComplete('ESTIMATE', phases)) {
    return {error: {message: 'Estimate phase is already complete'}}
  }

  // VALIDATION
  const estimatePhase = getPhase(phases, 'ESTIMATE')
  const {stages} = estimatePhase
  const stage = stages.find((stage) => stage.id === stageId)
  if (!stage) {
    return {error: {message: 'Invalid stageId provided'}}
  }

  // RESOLUTION
  const redis = getRedis()
  const key = `pokerHover:${stageId}`
  if (isHover) {
    const [numAddedRes] = (await redis
      .multi()
      .sadd(key, viewerId)
      .pexpire(key, ms('1h'))
      .exec()) as [RedisPipelineResponse<1 | 0>]
    const numAdded = numAddedRes[1]
    if (numAdded !== 1) {
      return {error: {message: 'Already hovering'}}
    }
  } else {
    const numRemoved = await redis.srem(key, viewerId)
    if (numRemoved !== 1) {
      return {error: {message: 'Not hovering'}}
    }
  }

  const data = {meetingId, stageId, userId: viewerId, isHover}
  publish(SubscriptionChannel.MEETING, meetingId, 'PokerAnnounceDeckHoverSuccess', data, subOptions)
  return data
}

export default pokerAnnounceDeckHover
