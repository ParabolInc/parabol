import {GraphQLID, GraphQLNonNull} from 'graphql'
import EndDraggingReflectionPayload from 'server/graphql/types/EndDraggingReflectionPayload'
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
import DragReflectionDropTargetTypeEnum, {
  REFLECTION_GRID,
  REFLECTION_GROUP
} from 'server/graphql/mutations/DragReflectionDropTargetTypeEnum'
import addReflectionToGroup from 'server/graphql/mutations/helpers/updateReflectionLocation/addReflectionToGroup'
import removeReflectionFromGroup from 'server/graphql/mutations/helpers/updateReflectionLocation/removeReflectionFromGroup'

export default {
  description: 'Broadcast that the viewer stopped dragging a reflection',
  type: EndDraggingReflectionPayload,
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    dropTargetType: {
      description:
        'if it was a drop (isDragging = false), the type of item it was dropped on. null if there was no valid drop target',
      type: DragReflectionDropTargetTypeEnum
    },
    dropTargetId: {
      description:
        'if dropTargetType could refer to more than 1 component, this ID defines which one',
      type: GraphQLID
    },
    dragId: {
      description: 'the ID of the drag to connect to the start drag event',
      type: GraphQLID
    }
  },
  async resolve (source, {reflectionId, dropTargetType, dropTargetId, dragId}, context) {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const reflection = await dataLoader.get('retroReflections').load(reflectionId)
    if (!reflection) {
      return sendReflectionNotFoundError(authToken, reflectionId)
    }
    const {meetingId, reflectionGroupId: oldReflectionGroupId} = reflection
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

    let newReflectionGroupId
    if (dropTargetType === REFLECTION_GRID) {
      // ungroup
      newReflectionGroupId = await removeReflectionFromGroup(reflectionId, context)
    } else if (dropTargetType === REFLECTION_GROUP && dropTargetId) {
      // group
      newReflectionGroupId = await addReflectionToGroup(reflectionId, dropTargetId, context)
    }

    if (typeof newReflectionGroupId === 'object') {
      publish(TEAM, teamId, EndDraggingReflectionPayload, newReflectionGroupId, subOptions)
    }

    // RESOLUTION
    const data = {
      meetingId,
      reflectionId,
      reflectionGroupId: newReflectionGroupId,
      oldReflectionGroupId,
      userId: viewerId,
      dropTargetType,
      dropTargetId,
      dragId
    }

    publish(TEAM, teamId, EndDraggingReflectionPayload, data, subOptions)
    return data
  }
}
