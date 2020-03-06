import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import normalizeRawDraftJS from 'parabol-client/validation/normalizeRawDraftJS'
import getRethink from '../../database/rethinkDriver'
import Comment from '../../database/types/Comment'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import AddCommentInput from '../types/AddCommentInput'
import AddCommentPayload from '../types/AddCommentPayload'
import validateThreadableReflectionGroupId from './validateThreadableReflectionGroupId'
import {IAddCommentOnMutationArguments} from 'parabol-client/types/graphql'

const addComment = {
  type: GraphQLNonNull(AddCommentPayload),
  description: `Add a comment to a discussion`,
  args: {
    comment: {
      type: GraphQLNonNull(AddCommentInput),
      description: 'A partial new comment'
    }
  },
  resolve: async (
    _source,
    {comment}: IAddCommentOnMutationArguments,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const {meetingId, threadId, threadSource} = comment
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)

    const [viewerMeetingMember, threadError] = await Promise.all([
      dataLoader.get('meetingMembers').load(meetingMemberId),
      validateThreadableReflectionGroupId(threadSource, threadId, meetingId, dataLoader)
    ])

    if (!viewerMeetingMember) {
      return {error: {message: 'Not a member of the meeting'}}
    }
    if (threadError) {
      return {error: {message: threadError}}
    }

    // VALIDATION
    const content = normalizeRawDraftJS(comment.content)

    const dbComment = new Comment({...comment, content, createdBy: viewerId})
    const {id: commentId} = dbComment
    await r
      .table('Comment')
      .insert(dbComment)
      .run()

    const data = {commentId}

    publish(SubscriptionChannel.MEETING, meetingId, 'AddCommentSuccess', data, subOptions)
    return data
  }
}

export default addComment
