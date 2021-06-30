import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingMemberId from '../../../client/shared/gqlIds/MeetingMemberId'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import EditCommentingPayload from '../types/EditCommentingPayload'

export default {
  type: EditCommentingPayload,
  description: 'Track which users are commenting',
  args: {
    isCommenting: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'True if the user is commenting, false if the user has stopped commenting'
    },
    discussionId: {
      type: GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source,
    {isCommenting, discussionId},
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
    const data = {
      commentorId: viewerId,
      isCommenting,
      discussionId
    }
    publish(SubscriptionChannel.MEETING, meetingId, 'EditCommentingPayload', data, subOptions)

    return data
  }
}
