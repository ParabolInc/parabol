import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import unlockAllStagesForPhase from 'parabol-client/utils/unlockAllStagesForPhase'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const removeReflection: MutationResolvers['removeReflection'] = async (
  _source,
  {reflectionId},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const reflection = await dataLoader.get('retroReflections').load(reflectionId)

  if (!reflection) {
    throw new GraphQLError('Reflection not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const {meetingId, reflectionGroupId} = reflection

  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {endedAt, phases} = meeting

  if (endedAt) throw new GraphQLError('Meeting already ended', {extensions: {code: 'CONFLICT'}})
  if (isPhaseComplete('group', phases)) {
    throw new GraphQLError('Meeting phase already completed', {extensions: {code: 'CONFLICT'}})
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
  dataLoader.get('retroReflections').clear(reflectionId)
  const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  let unlockedStageIds: string[] | undefined
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

export default removeReflection
