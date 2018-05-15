import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {isTeamMember} from 'server/utils/authorization'
import shortid from 'shortid'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'
import {sendMeetingNotFoundError, sendReflectionNotFoundError} from 'server/utils/docNotFoundErrors'
import {
  sendAlreadyCompletedMeetingPhaseError,
  sendAlreadyEndedMeetingError
} from 'server/utils/alreadyMutatedErrors'
import publish from 'server/utils/publish'
import {GROUP, TEAM} from 'universal/utils/constants'
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete'
import CreateReflectionGroupPayload from 'server/graphql/types/CreateReflectionGroupPayload'
import makeRetroGroupTitle from 'server/graphql/mutations/helpers/makeRetroGroupTitle'
import {sendTooManyReflectionsError} from 'server/utils/__tests__/validationErrors'

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

    // AUTH
    const meeting = await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
    if (!meeting) return sendMeetingNotFoundError(authToken, meetingId)
    const {endedAt, phases, teamId} = meeting
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId)
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }
    if (isPhaseComplete(GROUP, phases)) {
      return sendAlreadyCompletedMeetingPhaseError(authToken, GROUP)
    }

    // VALIDATION
    if (reflectionIds.length > 2) {
      return sendTooManyReflectionsError(authToken, reflectionIds)
    }
    const reflections = await dataLoader.get('retroReflections').loadMany(reflectionIds)
    if (reflections.some((reflection) => !reflection || !reflection.isActive)) {
      return sendReflectionNotFoundError(authToken, reflectionIds)
    }

    // RESOLUTION
    const reflectionGroupId = shortid.generate()
    const {title, smartTitle} = makeRetroGroupTitle(meetingId, reflections)

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
