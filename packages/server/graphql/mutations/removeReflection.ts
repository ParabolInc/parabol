import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import unlockAllStagesForPhase from 'parabol-client/utils/unlockAllStagesForPhase'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import type {GQLContext} from '../graphql'
import RemoveReflectionPayload from '../types/RemoveReflectionPayload'

export default {
  type: RemoveReflectionPayload,
  description: 'Remove a reflection',
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source: unknown,
    {reflectionId}: {reflectionId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const reflection = await dataLoader.get('retroReflections').load(reflectionId)
    dataLoader.get('retroReflections').clear(reflectionId)
    if (!reflection) {
      return standardError(new Error('Reflection not found'), {
        userId: viewerId
      })
    }
    const {creatorId, meetingId, reflectionGroupId} = reflection
    if (creatorId !== viewerId) {
      return standardError(new Error('Reflection'), {userId: viewerId})
    }
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt)
      return standardError(new Error('Meeting already ended'), {
        userId: viewerId
      })
    if (isPhaseComplete('group', phases)) {
      return standardError(new Error('Meeting phase already completed'), {
        userId: viewerId
      })
    }

    // RESOLUTION
    await pg
      .with('delReflection', (qc) =>
        qc.updateTable('RetroReflection').set({isActive: false}).where('id', '=', reflectionId)
      )
      .updateTable('RetroReflectionGroup')
      .set({isActive: false})
      .where('id', '=', reflectionGroupId)
      .where(
        ({selectFrom}) =>
          selectFrom('RetroReflection')
            .select(({fn}) => fn.countAll().as('count'))
            .where('reflectionGroupId', '=', reflectionGroupId)
            .where('id', '!=', reflectionId)
            .where('isActive', '=', true),
        '=',
        0
      )
      .execute()
    const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
    let unlockedStageIds
    if (reflections.length === 0) {
      unlockedStageIds = unlockAllStagesForPhase(phases, 'group', true, false)
      await pg
        .updateTable('NewMeeting')
        .set({phases: JSON.stringify(phases)})
        .where('id', '=', meetingId)
        .execute()
    }
    const data = {meetingId, reflectionId, unlockedStageIds}
    publish(SubscriptionChannel.MEETING, meetingId, 'RemoveReflectionPayload', data, subOptions)
    return data
  }
}
