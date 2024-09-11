import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {PARABOL_AI_USER_ID} from '../../../../client/utils/constants'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

const deleteComment: MutationResolvers['deleteComment'] = async (
  _source,
  {commentId, meetingId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
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

export default deleteComment
