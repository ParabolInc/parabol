import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {PARABOL_AI_USER_ID} from '../../../client/utils/constants'
import getRethink from '../../database/rethinkDriver'
import getKysely from '../../postgres/getKysely'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import DeleteCommentPayload from '../types/DeleteCommentPayload'

type DeleteCommentMutationVariables = {
  commentId: string
  meetingId: string
}

const deleteComment = {
  type: new GraphQLNonNull(DeleteCommentPayload),
  description: `Delete a comment from a discussion`,
  args: {
    commentId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source: unknown,
    {commentId, meetingId}: DeleteCommentMutationVariables,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()

    //AUTH
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const [comment, viewerMeetingMember] = await Promise.all([
      dataLoader.get('comments').load(commentId),
      dataLoader.get('meetingMembers').load(meetingMemberId),
      dataLoader.get('newMeetings').load(meetingId)
    ])
    if (!comment || !comment.isActive) {
      return {error: {message: 'Comment does not exist'}}
    }
    if (!viewerMeetingMember) {
      return {error: {message: `Not a member of the meeting`}}
    }
    const {createdBy, discussionId} = comment
    const discussion = await dataLoader.get('discussions').loadNonNull(discussionId)
    if (discussion.meetingId !== meetingId) {
      return {error: {message: `Comment is not from this meeting`}}
    }
    if (createdBy !== viewerId && createdBy !== PARABOL_AI_USER_ID) {
      return {error: {message: 'Can only delete your own comment or Parabol AI comments'}}
    }

    await r.table('Comment').get(commentId).update({isActive: false, updatedAt: now}).run()
    await getKysely()
      .updateTable('Comment')
      .set({updatedAt: now})
      .where('id', '=', commentId)
      .execute()
    dataLoader.clearAll('comments')
    const data = {commentId}

    if (meetingId) {
      publish(SubscriptionChannel.MEETING, meetingId, 'DeleteCommentSuccess', data, subOptions)
    }
    return data
  }
}

export default deleteComment
