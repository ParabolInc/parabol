import {GraphQLFloat, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {isTeamMember} from 'server/utils/authorization'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'
import {sendMeetingNotFoundError} from 'server/utils/docNotFoundErrors'
import {
  sendAlreadyCompletedMeetingPhaseError,
  sendAlreadyEndedMeetingError
} from 'server/utils/alreadyMutatedErrors'
import publish from 'server/utils/publish'
import {GROUP, TEAM} from 'universal/utils/constants'
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete'
import AutoGroupReflectionsPayload from 'server/graphql/types/AutoGroupReflectionsPayload'
import {sendGroupingThresholdValidationError} from 'server/utils/__tests__/validationErrors'
import groupReflections from 'universal/utils/autogroup/groupReflections'

export default {
  type: AutoGroupReflectionsPayload,
  description: 'Automatically group reflections',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    groupingThreshold: {
      type: new GraphQLNonNull(GraphQLFloat),
      description:
        'A number from 0 to 1 to determine how tightly to pack the groups. Higher means fewer groups'
    }
  },
  async resolve (
    source,
    {meetingId, groupingThreshold},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
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
    if (groupingThreshold <= 0 || groupingThreshold >= 1) {
      return sendGroupingThresholdValidationError(authToken, meetingId, groupingThreshold)
    }

    // RESOLUTION
    // get reflections
    const reflections = await r
      .table('RetroReflection')
      .getAll(meetingId, {index: 'meetingId'})
      .filter({isActive: true})
    const {
      autoGroupThreshold,
      groupedReflections,
      groups,
      removedReflectionGroupIds,
      nextThresh
    } = groupReflections(reflections, groupingThreshold)
    await r({
      inactivatedGroups: r
        .table('RetroReflectionGroup')
        .getAll(r.args(removedReflectionGroupIds), {index: 'id'})
        .update({isActive: false}),
      groups: r(groups).forEach((group) =>
        r
          .table('RetroReflectionGroup')
          .get(group('id'))
          .update({
            title: group('title'),
            smartTitle: group('smartTitle'),
            updatedAt: now
          })
      ),
      reflections: r(groupedReflections).forEach((reflection) => {
        return r
          .table('RetroReflection')
          .get(reflection('id'))
          .update({
            autoReflectionGroupId: reflection('reflectionGroupId'),
            reflectionGroupId: reflection('reflectionGroupId'),
            sortOrder: reflection('sortOrder'),
            updatedAt: now
          })
      }),
      meeting: r
        .table('NewMeeting')
        .get(meetingId)
        .update({
          autoGroupThreshold,
          nextAutoGroupThreshold: nextThresh
        })
    })

    const reflectionGroupIds = groups.map(({id}) => id)
    const reflectionIds = groupedReflections.map(({id}) => id)
    const data = {meetingId, reflectionGroupIds, reflectionIds, removedReflectionGroupIds}
    publish(TEAM, teamId, AutoGroupReflectionsPayload, data, subOptions)
    return data
  }
}
