/**
 * Changes the editing state of a retrospective reflection.
 *
 * @flow
 */
import type {Context} from 'server/flowtypes/graphql'
import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
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

type Args = {
  isDragging: boolean,
  reflectionId: string
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
    }
  },
  async resolve (
    source: Object,
    {reflectionId, isDragging}: Args,
    {authToken, dataLoader, socketId: mutatorId}: Context
  ) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const reflection = await r.table('RetroReflection').get(reflectionId)
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
    const nextReflection = {
      ...reflection,
      draggerUserId: isDragging ? viewerId : null,
      draggerUser: isDragging ? await dataLoader.get('users').load(viewerId) : null
    }
    const data = {
      meetingId,
      reflection: nextReflection,
      userId: viewerId,
      isDragging
    }
    publish(TEAM, teamId, DragReflectionPayload, data, subOptions)
    return data
  }
}
