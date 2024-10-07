import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import ms from 'ms'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import getRedis, {RedisPipelineResponse} from '../../utils/getRedis'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import PokerAnnounceDeckHoverPayload from '../types/PokerAnnounceDeckHoverPayload'

const pokerAnnounceDeckHover = {
  type: new GraphQLNonNull(PokerAnnounceDeckHoverPayload),
  description: ``,
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    isHover: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the viewer has started hovering the deck, else false'
    }
  },
  resolve: async (
    _source: unknown,
    {meetingId, stageId, isHover}: {meetingId: string; stageId: string; isHover: boolean},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
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
    const {endedAt, phases, meetingType, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on the team'}}
    }
    if (endedAt) {
      return {error: {message: 'Meeting has ended'}}
    }
    if (meetingType !== 'poker') {
      return {error: {message: 'Not a poker meeting'}}
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
    // the key must include userId::stageId
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
        // this is primarily to avoid publishing a useless message to the pubsub
        return {error: {message: 'Already hovering'}}
      }
    } else {
      const numRemoved = await redis.srem(key, viewerId)
      if (numRemoved !== 1) {
        return {error: {message: 'Not hovering'}}
      }
    }

    const data = {meetingId, stageId, userId: viewerId, isHover}
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'PokerAnnounceDeckHoverSuccess',
      data,
      subOptions
    )
    return data
  }
}
export default pokerAnnounceDeckHover
