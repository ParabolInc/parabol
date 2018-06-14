/**
 * Changes the editing state of a retrospective reflection.
 *
 * @flow
 */
import type {Context} from 'server/flowtypes/graphql'
import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import DragReflectionPayload from 'server/graphql/types/DragReflectionPayload'
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
import DragReflectionDropTargetTypeEnum from 'server/graphql/mutations/DragReflectionDropTargetTypeEnum'

type Args = {
  isDragging: boolean,
  reflectionId: string,
  dropTargetType: string,
  dropTargetId?: string
}

export default {
  description: 'Changes the drag state of a retrospective reflection',
  type: DragReflectionPayload,
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    isDragging: {
      description: 'true if the viewer is starting a drag, else false',
      type: new GraphQLNonNull(GraphQLBoolean)
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
    }
  },
  async resolve (
    source: Object,
    {reflectionId, isDragging, dropTargetType, dropTargetId}: Args,
    {authToken, dataLoader, socketId: mutatorId}: Context
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
    const dragContext = {
      draggerUserId: viewerId
    }

    const data = {
      meetingId,
      reflection,
      reflectionId,
      reflectionGroupId: reflection.reflectionGroupId,
      dragContext,
      userId: viewerId,
      isDragging,
      dropTargetType,
      dropTargetId
    }
    publish(TEAM, teamId, DragReflectionPayload, data, subOptions)
    return data
  }
}
