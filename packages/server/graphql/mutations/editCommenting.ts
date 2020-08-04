import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import EditCommentingPayload from '../types/EditCommentingPayload'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'

const updateCommentingNames = (
  commentingNames: string[] | undefined | null,
  preferredName: string,
  isCommenting: boolean
) => {
  if (isCommenting) {
    if (!commentingNames) {
      return [preferredName]
    } else {
      return [...commentingNames, preferredName]
    }
  } else {
    if (!commentingNames || commentingNames.length <= 1) {
      return null
    } else {
      return commentingNames.filter((name) => name !== preferredName)
    }
  }
}
export default {
  type: EditCommentingPayload,
  description: `Track which users are commenting`,
  args: {
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
    reflectionGroupId: {
      type: GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source,
    {isCommenting, meetingId, preferredName, reflectionGroupId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
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
    const reflectionGroup = await r
      .table('RetroReflectionGroup')
      .get(reflectionGroupId)
      .run()
    console.log('reflectionGroup', reflectionGroup)
    const agendaItem = await r
      .table('AgendaItem')
      .get(reflectionGroupId)
      .run()
    console.log('agendaItem', agendaItem)
    if (reflectionGroup) {
      const commentingNames = reflectionGroup.commentingNames

      if (!isCommenting && !commentingNames)
        return {error: {message: "Can't remove an id that doesn't exist!"}}

      const updatedCommentingNames = updateCommentingNames(
        commentingNames,
        preferredName,
        isCommenting
      )

      await r
        .table('RetroReflectionGroup')
        .get(reflectionGroupId)
        .update({commentingNames: updatedCommentingNames, updatedAt: now})
        .run()
    } else if (agendaItem) {
      const commentingNames = agendaItem.commentingNames

      if (!isCommenting && !commentingNames)
        return {error: {message: "Can't remove an id that doesn't exist!"}}

      const updatedCommentingNames = updateCommentingNames(
        commentingNames,
        preferredName,
        isCommenting
      )

      await r
        .table('AgendaItem')
        .get(reflectionGroupId)
        .update({commentingNames: updatedCommentingNames, updatedAt: now})
        .run()
    }

    const data = {isCommenting, meetingId, preferredName, reflectionGroupId}
    publish(SubscriptionChannel.MEETING, meetingId, 'EditCommentingPayload', data, subOptions)

    return data
  }
}
