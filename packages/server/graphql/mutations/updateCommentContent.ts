import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import normalizeRawDraftJS from 'parabol-client/validation/normalizeRawDraftJS'
import {PARABOL_AI_USER_ID} from '../../../client/utils/constants'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import UpdateCommentContentPayload from '../types/UpdateCommentContentPayload'

export default {
  type: UpdateCommentContentPayload,
  description: 'Update the content of a comment',
  args: {
    commentId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A stringified draft-js document containing thoughts'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source: unknown,
    {commentId, content, meetingId}: {commentId: string; content: string; meetingId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const now = new Date()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const [comment, viewerMeetingMember] = await Promise.all([
      r.table('Comment').get(commentId).run(),
      dataLoader.get('meetingMembers').load(meetingMemberId),
      dataLoader.get('newMeetings').load(meetingId)
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

    // :TODO: (jmtaber129): diff new and old comment content for mentions and handle notifications
    // appropriately.

    const data = {commentId}
    if (meetingId) {
      publish(
        SubscriptionChannel.MEETING,
        meetingId,
        'UpdateCommentContentSuccess',
        data,
        subOptions
      )
    }
    return data
  }
}
