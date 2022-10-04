import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import StartDraggingReflectionPayload from '../types/StartDraggingReflectionPayload'

export default {
  description: 'Broadcast that the viewer started dragging a reflection',
  type: StartDraggingReflectionPayload,
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    dragId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    isSpotlight: {
      type: GraphQLBoolean
    }
  },
  async resolve(
    _source: unknown,
    {
      dragId,
      reflectionId,
      isSpotlight
    }: {dragId: string; reflectionId: string; isSpotlight?: boolean | null},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const reflection = await dataLoader.get('retroReflections').load(reflectionId)
    if (!reflection) {
      return standardError(new Error('Reflection not found'), {userId: viewerId})
    }
    const {meetingId} = reflection
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (isPhaseComplete('group', phases)) {
      return standardError(new Error('Meeting already completed'), {userId: viewerId})
    }

    // RESOLUTION
    const data = {
      teamId,
      meetingId,
      reflectionId,
      remoteDrag: {
        id: dragId,
        dragUserId: viewerId,
        isSpotlight
      }
    }
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'StartDraggingReflectionPayload',
      data,
      subOptions
    )

    return data
  }
}
