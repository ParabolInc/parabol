import {generateText} from '@tiptap/core'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import {PARABOL_AI_USER_ID} from '../../../../client/utils/constants'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {convertToTipTap} from '../../../utils/convertToTipTap'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
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
    return standardError(new Error('comment not found'), {userId: viewerId})
  }
  const {createdBy, discussionId} = comment
  const discussion = await dataLoader.get('discussions').loadNonNull(discussionId)
  if (discussion.meetingId !== meetingId) {
    return {error: {message: `Comment is not from this meeting`}}
  }
  if (createdBy !== viewerId && createdBy !== PARABOL_AI_USER_ID) {
    return {
      error: {
        message: 'Can only update your own comment or Parabol AI comments'
      }
    }
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
