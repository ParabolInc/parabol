import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import normalizeRawDraftJS from 'parabol-client/validation/normalizeRawDraftJS'
import MeetingMemberId from '../../../client/shared/gqlIds/MeetingMemberId'
import getRethink from '../../database/rethinkDriver'
import Comment from '../../database/types/Comment'
import GenericMeetingPhase, {
  NewMeetingPhaseTypeEnum
} from '../../database/types/GenericMeetingPhase'
import GenericMeetingStage from '../../database/types/GenericMeetingStage'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import AddCommentInput from '../types/AddCommentInput'
import AddCommentPayload from '../types/AddCommentPayload'

type AddCommentMutationVariables = {
  comment: {
    discussionId: string
    content: string
    threadSortOrder: number
    isAI?: boolean
  }
}

const addComment = {
  type: new GraphQLNonNull(AddCommentPayload),
  description: `Add a comment to a discussion`,
  args: {
    comment: {
      type: new GraphQLNonNull(AddCommentInput),
      description: 'A partial new comment'
    }
  },
  resolve: async (
    _source: unknown,
    {comment}: AddCommentMutationVariables,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const {discussionId, isAI} = comment
    const discussion = await dataLoader.get('discussions').load(discussionId)
    if (!discussion) {
      return {error: {message: 'Invalid discussion thread'}}
    }
    const {meetingId} = discussion
    if (!meetingId) {
      return {error: {message: 'Discussion does not take place in a meeting'}}
    }
    const meetingMemberId = MeetingMemberId.join(meetingId, viewerId)
    const [meeting, viewerMeetingMember] = await Promise.all([
      dataLoader.get('newMeetings').load(meetingId),
      dataLoader.get('meetingMembers').load(meetingMemberId)
    ])

    if (!viewerMeetingMember) {
      return {error: {message: 'Not a member of the meeting'}}
    }

    // VALIDATION
    const content = normalizeRawDraftJS(comment.content)

    const createdBy = isAI ? 'parabolAIUser' : viewerId
    const dbComment = new Comment({...comment, content, createdBy})
    console.log('🚀 ~ dbComment', dbComment)
    const {id: commentId, isAnonymous, threadParentId} = dbComment
    await r.table('Comment').insert(dbComment).run()

    const data = {commentId, meetingId}
    const {phases} = meeting!
    const threadablePhases = [
      'discuss',
      'agendaitems',
      'ESTIMATE',
      'RESPONSES'
    ] as NewMeetingPhaseTypeEnum[]
    const containsThreadablePhase = phases.find(({phaseType}: GenericMeetingPhase) =>
      threadablePhases.includes(phaseType)
    )!
    const {stages} = containsThreadablePhase
    const isAsync = stages.some((stage: GenericMeetingStage) => stage.isAsync)
    analytics.commentAdded(viewerId, meeting, isAnonymous, isAsync, !!threadParentId)
    publish(SubscriptionChannel.MEETING, meetingId, 'AddCommentSuccess', data, subOptions)
    return data
  }
}

export default addComment
