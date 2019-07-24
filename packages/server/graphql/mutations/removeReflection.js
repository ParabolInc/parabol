import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GROUP, REFLECT, TEAM} from '../../../client/utils/constants'
import isPhaseComplete from '../../../client/utils/meetings/isPhaseComplete'
import RemoveReflectionPayload from '../types/RemoveReflectionPayload'
import removeEmptyReflectionGroup from './helpers/removeEmptyReflectionGroup'
import unlockAllStagesForPhase from '../../../client/utils/unlockAllStagesForPhase'
import standardError from '../../utils/standardError'

export default {
  type: RemoveReflectionPayload,
  description: 'Remove a reflection',
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve (source, {reflectionId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const now = new Date()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const reflection = await r.table('RetroReflection').get(reflectionId)
    if (!reflection) {
      return standardError(new Error('Reflection not found'), {userId: viewerId})
    }
    const {creatorId, meetingId, reflectionGroupId} = reflection
    if (creatorId !== viewerId) {
      return standardError(new Error('Reflection'), {userId: viewerId})
    }
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (isPhaseComplete(REFLECT, phases)) {
      return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('RetroReflection')
      .get(reflectionId)
      .update({
        isActive: false,
        updatedAt: now
      })
    await removeEmptyReflectionGroup(reflectionGroupId, reflectionGroupId)
    const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
    let unlockedStageIds
    if (reflections.length === 0) {
      unlockedStageIds = unlockAllStagesForPhase(phases, GROUP, true, false)
      await r
        .table('NewMeeting')
        .get(meetingId)
        .update({
          phases
        })
    }
    const data = {meetingId, reflectionId, unlockedStageIds}
    publish(TEAM, teamId, RemoveReflectionPayload, data, subOptions)
    return data
  }
}
