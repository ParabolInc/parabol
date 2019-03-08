import {GraphQLID, GraphQLNonNull} from 'graphql'
import StartDraggingReflectionPayload from 'server/graphql/types/StartDraggingReflectionPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {GROUP, TEAM} from 'universal/utils/constants'
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete'
import Coords2DInput from 'server/graphql/types/Coords2DInput'
import * as shortid from 'shortid'
import standardError from 'server/utils/standardError'

export default {
  description: 'Broadcast that the viewer started dragging a reflection',
  type: StartDraggingReflectionPayload,
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    initialCoords: {
      type: new GraphQLNonNull(Coords2DInput)
    }
  },
  async resolve(
    source,
    {initialCoords, reflectionId},
    {authToken, dataLoader, socketId: mutatorId}
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
    if (isPhaseComplete(GROUP, phases)) {
      return standardError(new Error('Meeting already completed'), {userId: viewerId})
    }

    // RESOLUTION
    const data = {
      teamId,
      meetingId,
      reflectionId,
      dragContext: {
        // required so relay doesn't assign the same ID every time
        id: shortid.generate(),
        dragUserId: viewerId,
        dragCoords: initialCoords
      }
    }
    publish(TEAM, teamId, StartDraggingReflectionPayload, data, subOptions)
    return data
  }
}
