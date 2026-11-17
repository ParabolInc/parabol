import {generateText} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import {PARABOL_AI_USER_ID} from '../../../../client/utils/constants'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {convertToTipTap} from '../../../utils/convertToTipTap'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateCommentContent: MutationResolvers['updateCommentContent'] = async (
  _source,
  {commentId, content, meetingId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const viewerId = getUserId(authToken)
  const comment = await dataLoader.get('comments').load(commentId)
  if (!comment || !comment.isActive) {
    throw new GraphQLError('comment not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const {createdBy, discussionId} = comment
  const discussion = await dataLoader.get('discussions').loadNonNull(discussionId)
  if (discussion.meetingId !== meetingId) {
    throw new GraphQLError(`Comment is not from this meeting`, {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (createdBy !== viewerId && createdBy !== PARABOL_AI_USER_ID) {
    throw new GraphQLError('Can only update your own comment or Parabol AI comments', {
      extensions: {code: 'FORBIDDEN'}
    })
  }

  // VALIDATION
  const normalizedContent = convertToTipTap(content)
  const plaintextContent = generateText(normalizedContent, serverTipTapExtensions)

  // RESOLUTION
  await getKysely()
    .updateTable('Comment')
    .set({content: normalizedContent, plaintextContent})
    .where('id', '=', commentId)
    .execute()
  dataLoader.clearAll('comments')
  // :TODO: (jmtaber129): diff new and old comment content for mentions and handle notifications
  // appropriately.

  const data = {commentId}
  if (meetingId) {
    publish(SubscriptionChannel.MEETING, meetingId, 'UpdateCommentContentSuccess', data, subOptions)
  }
  return data
}

export default updateCommentContent
