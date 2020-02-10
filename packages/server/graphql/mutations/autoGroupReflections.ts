import {GraphQLFloat, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GROUP} from '../../../client/utils/constants'
import isPhaseComplete from '../../../client/utils/meetings/isPhaseComplete'
import AutoGroupReflectionsPayload from '../types/AutoGroupReflectionsPayload'
import groupReflections from '../../../client/utils/autogroup/groupReflections'
import sendSegmentEvent from '../../utils/sendSegmentEvent'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

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
    _source,
    {meetingId, groupingThreshold},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const now = new Date()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    const meeting = await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
      .run()
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
          } as any)
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
          } as any)
      }),
      meeting: r
        .table('NewMeeting')
        .get(meetingId)
        .update({
          autoGroupThreshold,
          nextAutoGroupThreshold: nextThresh
        })
    }).run()

    const reflectionGroupIds = groups.map(({id}) => id)
    const reflectionIds = groupedReflections.map(({id}) => id)
    const data = {meetingId, reflectionGroupIds, reflectionIds, removedReflectionGroupIds}
    publish(SubscriptionChannel.MEETING, meetingId, 'AutoGroupReflectionsPayload', data, subOptions)
    sendSegmentEvent('Autogroup', viewerId, {meetingId})
    return data
  }
}
