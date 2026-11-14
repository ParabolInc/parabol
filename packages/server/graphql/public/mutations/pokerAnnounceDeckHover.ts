import {GraphQLError} from 'graphql'
import ms from 'ms'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import {getUserId} from '../../../utils/authorization'
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
    throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  }
  if (meeting.meetingType !== 'poker') {
    throw new GraphQLError('Not a poker meeting', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const {endedAt, phases} = meeting
  if (endedAt) {
    throw new GraphQLError('Meeting has ended', {extensions: {code: 'CONFLICT'}})
  }
  if (isPhaseComplete('ESTIMATE', phases)) {
    throw new GraphQLError('Estimate phase is already complete', {extensions: {code: 'CONFLICT'}})
  }

  // VALIDATION
  const estimatePhase = getPhase(phases, 'ESTIMATE')
  const {stages} = estimatePhase
  const stage = stages.find((stage) => stage.id === stageId)
  if (!stage) {
    throw new GraphQLError('Invalid stageId provided', {extensions: {code: 'BAD_USER_INPUT'}})
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
      throw new GraphQLError('Already hovering', {extensions: {code: 'CONFLICT'}})
    }
  } else {
    const numRemoved = await redis.srem(key, viewerId)
    if (numRemoved !== 1) {
      throw new GraphQLError('Not hovering', {extensions: {code: 'CONFLICT'}})
    }
  }

  const data = {meetingId, stageId, userId: viewerId, isHover}
  publish(SubscriptionChannel.MEETING, meetingId, 'PokerAnnounceDeckHoverSuccess', data, subOptions)
  return data
}

export default pokerAnnounceDeckHover
