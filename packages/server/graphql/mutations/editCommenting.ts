import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import EditCommentingPayload from '../types/EditCommentingPayload'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import ThreadSourceEnum from '../types/ThreadSourceEnum'
import {ThreadSourceEnum as ThreadSourceEnumType} from 'parabol-client/types/graphql'

// const getNewCommentinIds = (
//   commentinIds: string[] | null,
//   preferredName: string,
//   isCommenting: boolean
// ) => {
//   if (isCommenting) {
//     if (!commentinIds) {
//       return [preferredName]
//     } else {
//       return [...commentinIds, preferredName]
//     }
//   } else {
//     if (commentinIds && commentinIds.length > 1) {
//       // remove first occurrance of name as two users could have same name
//       const nameIndex = commentinIds.findIndex((id) => id === viewerId)
//       const newCommentinIds = commentinIds.map((id) => name)
//       newCommentinIds.splice(nameIndex, 1)
//       return newCommentinIds
//     }
//   }
//   return null
// }
export default {
  type: EditCommentingPayload,
  description: `Track which users are commenting`,
  args: {
    isCommenting: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user is commenting, false if the user has stopped commenting'
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
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
    {isCommenting, meetingId, threadId, threadSource},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    console.log('isCommenting', isCommenting)
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()

    //AUTH
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)

    const [meeting, viewerMeetingMember] = await Promise.all([
      r
        .table('NewMeeting')
        .get(meetingId)
        .run(),
      dataLoader.get('meetingMembers').load(meetingMemberId)
    ])

    if (!meeting) {
      return {error: {message: 'Meeting not found'}}
    }
    if (!viewerMeetingMember) {
      return {error: {message: `Not a part of the meeting`}}
    }
    const {endedAt} = meeting
    if (endedAt) {
      return {error: {message: 'Meeting already ended'}}
    }

    // RESOLUTION
    if (threadSource === ThreadSourceEnumType.REFLECTION_GROUP) {
      // const reflectionGroup = await r
      //   .table('RetroReflectionGroup')
      //   .get(threadId)
      //   .run()
      // console.log('reflectionGroup', reflectionGroup)
      // if (!reflectionGroup)
      //   return {error: {message: "A reflection group with that ID doesn't exist"}}
      // const commentinIds = reflectionGroup.commentinIds
      // if (!isCommenting && !commentinIds)
      //   return {error: {message: "Can't remove an id that doesn't exist!"}}
      // const newCommentinIds = getNewCommentinIds(commentinIds, preferredName, isCommenting)
      // await r
      //   .table('RetroReflectionGroup')
      //   .get(threadId)
      //   .update({commentinIds: newCommentinIds as string[] | null, updatedAt: now})
      //   .run()
    } else if (threadSource === ThreadSourceEnumType.AGENDA_ITEM) {
      // const agendaItem = await r
      //   .table('AgendaItem')
      //   .get(threadId)
      //   .run()
      // console.log('agendaItem', agendaItem)
      // const commentinIds = agendaItem.commentinIds
      // if (!isCommenting && !commentinIds)
      //   return {error: {message: "Can't remove an id that doesn't exist!"}}
      // const newCommentinIds = getNewCommentinIds(commentinIds, preferredName, isCommenting)
      // await r
      //   .table('AgendaItem')
      //   .get(threadId)
      //   .update({
      //     commentinIds: newCommentingNam]es as string[] | null,
      //     updatedAt: now
      //   })
      //   .run()
    }

    const data = {
      isCommenting,
      commentorId: viewerId,
      meetingId,
      threadId,
      threadSource,
      test: 'BERTY'
    }
    console.log('data', data)
    publish(SubscriptionChannel.MEETING, meetingId, 'EditCommentingPayload', data, subOptions)

    return data
  }
}
