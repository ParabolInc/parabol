import {GraphQLFloat, GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GROUP} from 'parabol-client/utils/constants'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import groupReflections from 'parabol-client/utils/smartGroup/groupReflections'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import AutoGroupReflectionsPayload from '../types/AutoGroupReflectionsPayload'

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
  async resolve(
    _source: unknown,
    {meetingId, groupingThreshold}: {meetingId: string; groupingThreshold: number},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const now = new Date()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    const meeting = await r.table('NewMeeting').get(meetingId).default(null).run()
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, phases, teamId} = meeting
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (isPhaseComplete(GROUP, phases)) {
      return standardError(new Error('Meeting already completed'), {userId: viewerId})
    }

    // VALIDATION
    if (groupingThreshold <= 0 || groupingThreshold >= 1) {
      return standardError(new Error('Invalid grouping threshold'), {userId: viewerId})
    }

    // RESOLUTION
    // get reflections
    const reflections = await r
      .table('RetroReflection')
      .getAll(meetingId, {index: 'meetingId'})
      .filter({isActive: true})
      .run()
    const {
      autoGroupThreshold,
      groupedReflectionsRes,
      groups,
      removedReflectionGroupIds,
      nextThresh
    } = groupReflections(reflections, {groupingThreshold})
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
          } as any)
      ),
      reflections: r(groupedReflectionsRes).forEach((reflection) => {
        return r
          .table('RetroReflection')
          .get(reflection('id'))
          .update({
            autoReflectionGroupId: reflection('reflectionGroupId'),
            reflectionGroupId: reflection('reflectionGroupId'),
            sortOrder: reflection('sortOrder'),
            updatedAt: now
          } as any)
      }),
      meeting: r.table('NewMeeting').get(meetingId).update({
        autoGroupThreshold,
        nextAutoGroupThreshold: nextThresh
      })
    }).run()

    const reflectionGroupIds = groups.map(({id}) => id)
    const reflectionIds = groupedReflectionsRes.map(({reflectionId}) => reflectionId)
    const data = {meetingId, reflectionGroupIds, reflectionIds, removedReflectionGroupIds}
    publish(SubscriptionChannel.MEETING, meetingId, 'AutoGroupReflectionsPayload', data, subOptions)
    return data
  }
}
