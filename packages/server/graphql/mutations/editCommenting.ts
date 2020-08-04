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

const getNewCommentingNames = (
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
    threadId: {
      type: GraphQLNonNull(GraphQLID)
    },
    threadSource: {
      type: GraphQLNonNull(ThreadSourceEnum)
    }
  },
  resolve: async (
    _source,
    {isCommenting, meetingId, preferredName, threadId, threadSource},
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

    if (threadSource === ThreadSourceEnumType.REFLECTION_GROUP) {
      const reflectionGroup = await r
        .table('RetroReflectionGroup')
        .get(threadId)
        .run()
      if (!reflectionGroup)
        return {error: {message: "A reflection group with that ID doesn't exist"}}
      const commentingNames = reflectionGroup.commentingNames

      if (!isCommenting && !commentingNames)
        return {error: {message: "Can't remove an id that doesn't exist!"}}

      const newCommentingNames = getNewCommentingNames(commentingNames, preferredName, isCommenting)

      await r
        .table('RetroReflectionGroup')
        .get(threadId)
        .update({commentingNames: newCommentingNames, updatedAt: now})
        .run()
    } else if (threadSource === ThreadSourceEnumType.AGENDA_ITEM) {
      const agendaItem = await r
        .table('AgendaItem')
        .get(threadId)
        .run()
      const commentingNames = agendaItem.commentingNames

      if (!isCommenting && !commentingNames)
        return {error: {message: "Can't remove an id that doesn't exist!"}}

      const newCommentingNames = getNewCommentingNames(commentingNames, preferredName, isCommenting)

      await r
        .table('AgendaItem')
        .get(threadId)
        .update({commentingNames: newCommentingNames, updatedAt: now})
        .run()
    }

    const data = {isCommenting, meetingId, preferredName, threadId, threadSource}
    publish(SubscriptionChannel.MEETING, meetingId, 'EditCommentingPayload', data, subOptions)

    return data
  }
}
