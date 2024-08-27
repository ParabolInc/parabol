import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import normalizeRawDraftJS from 'parabol-client/validation/normalizeRawDraftJS'
import {PARABOL_AI_USER_ID} from '../../../../client/utils/constants'
import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const updateCommentContent: MutationResolvers['updateCommentContent'] = async (
  _source,
  {commentId, content, meetingId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const operationId = dataLoader.share()
  const now = new Date()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const viewerId = getUserId(authToken)
  const meetingMemberId = toTeamMemberId(meetingId, viewerId)
  const [comment, viewerMeetingMember] = await Promise.all([
    dataLoader.get('comments').load(commentId),
    dataLoader.get('meetingMembers').load(meetingMemberId)
  ])
  if (!comment || !comment.isActive) {
    return standardError(new Error('comment not found'), {userId: viewerId})
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
    return {error: {message: 'Can only update your own comment or Parabol AI comments'}}
  }

  // VALIDATION
  const normalizedContent = normalizeRawDraftJS(content)

  // RESOLUTION
  const plaintextContent = extractTextFromDraftString(normalizedContent)
  await r
    .table('Comment')
    .get(commentId)
    .update({content: normalizedContent, plaintextContent, updatedAt: now})
    .run()
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
