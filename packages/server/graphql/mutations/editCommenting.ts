import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
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
    threadId: {
      type: GraphQLNonNull(GraphQLID)
    },
    threadSource: {
      type: GraphQLNonNull(ThreadSourceEnum)
    }
  },
  resolve: async (
    _source,
    {isAnonymous, threadId, threadSource, isCommenting},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    console.log('threadId', threadId)
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

    const thread = await r
      .table('RetroReflection')
      .getAll(threadId, {index: 'reflectionGroupId'})
      .run()
    console.log('thread', thread)
    thread[0].commentingIds = [viewerId]
    console.log('thread DOS', thread)

    await r
      .table('RetroReflection')
      .getAll(threadId, {index: 'reflectionGroupId'})
      .update({commentingIds: [viewerId], updatedAt: now})
      .run()

    // const currentMeeting = await r
    //   .table('NewMeeting')
    //   .get(meetingId)
    //   .run()
    // const {phases} = currentMeeting
    // const discussPhase = phases.find((phase) => phase.phaseType === DISCUSS) as DiscussPhase
    // if (isCommenting) {
    //   discussPhase.commentingIds = [...discussPhase.commentingIds, viewerId]
    // } else {
    //   console.log(' discussPhase.commentingIds', discussPhase.commentingIds)
    //   const filteredCommentingIds = discussPhase.commentingIds.filter((id) => id !== viewerId)
    //   console.log('filteredCommentingIds', filteredCommentingIds)
    //   discussPhase.commentingIds = filteredCommentingIds
    // }
    // console.log('discussPhase.commentingIds', discussPhase.commentingIds)
    // console.log('phases', phases)
    // await r
    //   .table('NewMeeting')
    //   .get(meetingId)
    //   .update({
    //     phases,
    //     updatedAt: now
    //   })
    //   .run()

    // const data = {commentingId: viewerId, isCommenting}
    // publish(SubscriptionChannel.MEETING, meetingId, 'EditCommentingPayload', data, subOptions)

    // return data
  }
}
