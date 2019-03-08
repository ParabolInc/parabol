import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import UpdateReflectionContentPayload from 'server/graphql/types/UpdateReflectionContentPayload'
import normalizeRawDraftJS from 'universal/validation/normalizeRawDraftJS'
import publish from 'server/utils/publish'
import {REFLECT, TEAM} from 'universal/utils/constants'
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete'
import standardError from 'server/utils/standardError'

export default {
  type: UpdateReflectionContentPayload,
  description: 'Update the content of a reflection',
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A stringified draft-js document containing thoughts'
    }
  },
  async resolve(source, {reflectionId, content}, {authToken, dataLoader, socketId: mutatorId}) {
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
    const {creatorId, meetingId} = reflection
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (isPhaseComplete(REFLECT, phases)) {
      return standardError(new Error('Meeting phase already ended'), {userId: viewerId})
    }
    if (creatorId !== viewerId) {
      return standardError(new Error('Reflection not found'), {userId: viewerId})
    }

    // VALIDATION
    const normalizedContent = normalizeRawDraftJS(content)

    // RESOLUTION
    await r
      .table('RetroReflection')
      .get(reflectionId)
      .update({
        content: normalizedContent,
        updatedAt: now
      })

    const data = {meetingId, reflectionId}
    publish(TEAM, teamId, UpdateReflectionContentPayload, data, subOptions)
    return data
  }
}
