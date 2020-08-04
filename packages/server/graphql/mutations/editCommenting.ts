import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {IAddCommentOnMutationArguments, NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import normalizeRawDraftJS from 'parabol-client/validation/normalizeRawDraftJS'
import getRethink from '../../database/rethinkDriver'
import Comment from '../../database/types/Comment'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import {GQLContext} from '../graphql'
import AddCommentInput from '../types/AddCommentInput'
import EditCommentingPayload from '../types/EditCommentingPayload'
import validateThreadableThreadSourceId from './validateThreadableThreadSourceId'
import DiscussPhase from '../../database/types/DiscussPhase'
import {DISCUSS} from 'parabol-client/utils/constants'
import ThreadSourceEnum from '../types/ThreadSourceEnum'
export default {
  type: EditCommentingPayload,
  description: `Track which users are commenting`,
  args: {
    isAnonymous: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the person commenting should be anonymous'
    },
    isCommenting: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user is commenting, false if the user has stopped commenting'
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    preferredName: {
      type: GraphQLNonNull(GraphQLString)
    },
    threadId: {
      type: GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source,
    {isAnonymous, isCommenting, meetingId, preferredName, threadId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    console.log('preferredName', preferredName)
    console.log('isCommenting', isCommenting)
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()

    //AUTH
    // const meetingMemberId = toTeamMemberId(meetingId, viewerId)

    // const [meeting, viewerMeetingMember] = await Promise.all([
    //   r
    //     .table('NewMeeting')
    //     .get(meetingId)
    //     .run(),
    //   dataLoader.get('meetingMembers').load(meetingMemberId)
    // ])

    // if (!meeting) {
    //   return {error: {message: 'Meeting not found'}}
    // }
    // if (!viewerMeetingMember) {
    //   return {error: {message: `Not a part of the meeting`}}
    // }
    // const {endedAt} = meeting
    // if (endedAt) {
    //   return {error: {message: 'Meeting already ended'}}
    // }

    // RESOLUTION

    // .getAll(threadId, {index: 'reflectionGroupId'})
    const thread = await r
      .table('RetroReflectionGroup')
      .get(threadId)
      .run()
    // if (!thread) return
    const commentingNames = thread.commentingNames
    console.log('commentingNames ', commentingNames)

    if (!isCommenting && !commentingNames)
      return {error: {message: "Can't remove an id that doesn't exist!"}}

    let updatedCommentingNames
    if (isCommenting) {
      if (!commentingNames) {
        updatedCommentingNames = [preferredName]
      } else {
        updatedCommentingNames = [...commentingNames, preferredName]
      }
    } else {
      if (!commentingNames || commentingNames?.length <= 1) {
        updatedCommentingNames = null
      } else {
        const test = commentingNames?.filter((id) => id !== preferredName)
        console.log('test', test)
        updatedCommentingNames = test
      }
    }
    console.log('updatedCommentingNames', updatedCommentingNames)

    await r
      .table('RetroReflectionGroup')
      .get(threadId)
      .update({commentingNames: updatedCommentingNames, updatedAt: now})
      .run()

    const data = {isAnonymous, isCommenting, meetingId, preferredName, threadId}
    publish(SubscriptionChannel.MEETING, meetingId, 'EditCommentingPayload', data, subOptions)

    return data
  }
}
