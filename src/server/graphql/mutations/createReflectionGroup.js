import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import shortid from 'shortid'
import publish from 'server/utils/publish'
import {GROUP, TEAM} from 'universal/utils/constants'
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete'
import CreateReflectionGroupPayload from 'server/graphql/types/CreateReflectionGroupPayload'
import makeRetroGroupTitle from 'universal/utils/autogroup/makeRetroGroupTitle'
import standardError from 'server/utils/standardError'

export default {
  type: CreateReflectionGroupPayload,
  description: 'Create a new reflection group',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    reflectionIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description:
        'An array of 1 or 2 reflections that make up the group. The first card in the array will be used to determine sort order'
    }
  },
  async resolve (source, {meetingId, reflectionIds}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const now = new Date()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    const meeting = await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, phases, teamId} = meeting
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (isPhaseComplete(GROUP, phases)) {
      return standardError(new Error('Meeting phase already complete'), {userId: viewerId})
    }

    // VALIDATION
    if (reflectionIds.length > 2) {
      return standardError(new Error('Too many reflections'), {userId: viewerId})
    }
    const reflections = await dataLoader.get('retroReflections').loadMany(reflectionIds)
    if (reflections.some((reflection) => !reflection || !reflection.isActive)) {
      return standardError(new Error('Reflection not found'), {userId: viewerId})
    }

    // RESOLUTION
    const reflectionGroupId = shortid.generate()
    const {title, smartTitle} = makeRetroGroupTitle(reflections)

    const reflectionGroup = {
      id: reflectionGroupId,
      createdAt: now,
      isActive: true,
      meetingId,
      smartTitle,
      title,
      updatedAt: now,
      voterIds: []
    }

    await r({
      group: r.table('RetroReflectionGroup').insert(reflectionGroup),
      reflections: r
        .table('RetroReflection')
        .getAll(r.args(reflectionIds), {index: 'id'})
        .update({
          reflectionGroupId
        })
    })

    const data = {meetingId, reflectionGroupId}
    publish(TEAM, teamId, CreateReflectionGroupPayload, data, subOptions)
    return data
  }
}
