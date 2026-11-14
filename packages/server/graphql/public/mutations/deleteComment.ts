import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {PARABOL_AI_USER_ID} from '../../../../client/utils/constants'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

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
  const [comment] = await Promise.all([
    dataLoader.get('comments').load(commentId),
    dataLoader.get('newMeetings').load(meetingId)
  ])
  if (!comment || !comment.isActive) {
    throw new GraphQLError('Comment does not exist', {extensions: {code: 'NOT_FOUND'}})
  }
  const {createdBy, discussionId} = comment
  const discussion = await dataLoader.get('discussions').loadNonNull(discussionId)
  if (discussion.meetingId !== meetingId) {
    throw new GraphQLError(`Comment is not from this meeting`, {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (createdBy !== viewerId && createdBy !== PARABOL_AI_USER_ID) {
    throw new GraphQLError('Can only delete your own comment or Parabol AI comments', {
      extensions: {code: 'FORBIDDEN'}
    })
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
