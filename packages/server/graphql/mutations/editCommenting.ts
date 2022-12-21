import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import ms from 'ms'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingMemberId from '../../../client/shared/gqlIds/MeetingMemberId'
import {getUserId} from '../../utils/authorization'
import getRedis, {RedisPipelineResponse} from '../../utils/getRedis'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import EditCommentingPayload from '../types/EditCommentingPayload'

export default {
  type: EditCommentingPayload,
  description: 'Track which users are commenting',
  args: {
    isCommenting: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'True if the user is commenting, false if the user has stopped commenting'
    },
    discussionId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source: unknown,
    {isCommenting, discussionId}: {isCommenting: boolean; discussionId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const discussion = await dataLoader.get('discussions').load(discussionId)
    if (!discussion) {
      return {error: {message: 'Discussion not found'}}
    }
    const {meetingId} = discussion

    const meetingMemberId = MeetingMemberId.join(meetingId, viewerId)
    const viewerMeetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
    if (!viewerMeetingMember) {
      return {error: {message: `Not a part of the meeting`}}
    }

    // RESOLUTION
    const redis = getRedis()
    const key = `commenting:${discussionId}`
    if (isCommenting) {
      const [numAddedRes] = (await redis
        .multi()
        .sadd(key, viewerId)
        .pexpire(key, ms('5m'))
        .exec()) as [RedisPipelineResponse<number>, RedisPipelineResponse<number>]
      const numAdded = numAddedRes![1]
      if (numAdded !== 1) {
        // this is primarily to avoid publishing a useless message to the pubsub
        return {error: {message: 'Already commenting'}}
      }
    } else {
      const numRemoved = await redis.srem(key, viewerId)
      if (numRemoved !== 1) {
        return {error: {message: 'Not commenting'}}
      }
    }

    // RESOLUTION
    const data = {
      discussionId
    }
    publish(SubscriptionChannel.MEETING, meetingId, 'EditCommentingSuccess', data, subOptions)

    return data
  }
}
