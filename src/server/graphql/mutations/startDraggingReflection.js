import {GraphQLID, GraphQLNonNull} from 'graphql'
import StartDraggingReflectionPayload from 'server/graphql/types/StartDraggingReflectionPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'
import {sendMeetingNotFoundError, sendReflectionNotFoundError} from 'server/utils/docNotFoundErrors'
import publish from 'server/utils/publish'
import {GROUP, TEAM} from 'universal/utils/constants'
import {
  sendAlreadyCompletedMeetingPhaseError,
  sendAlreadyEndedMeetingError
} from 'server/utils/alreadyMutatedErrors'
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete'
import Coords2DInput from 'server/graphql/types/Coords2DInput'

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
  async resolve (
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
      return sendReflectionNotFoundError(authToken, reflectionId)
    }
    const {meetingId} = reflection
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) return sendMeetingNotFoundError(authToken, meetingId)
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId)
    if (isPhaseComplete(GROUP, phases)) {
      return sendAlreadyCompletedMeetingPhaseError(authToken, GROUP)
    }

    // RESOLUTION
    const data = {
      meetingId,
      reflectionId,
      dragContext: {
        // required so relay doesn't assign the same ID every time
        id: `${reflectionId}-drag`,
        dragUserId: viewerId,
        dragCoords: initialCoords
      }
    }
    publish(TEAM, teamId, StartDraggingReflectionPayload, data, subOptions)
    return data
  }
}
