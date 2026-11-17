import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import type {ResetReflectionGroupType} from '../../../postgres/types'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {GQLContext} from '../../graphql'
import type {MutationResolvers} from '../resolverTypes'

type ExactSnapshotEntry = ResetReflectionGroupType &
  Required<
    Pick<
      ResetReflectionGroupType,
      'reflectionGroupId' | 'intoReflectionGroupId' | 'sortOrderByReflectionId'
    >
  >

const isExactSnapshotEntry = (entry: ResetReflectionGroupType): entry is ExactSnapshotEntry =>
  !!entry.reflectionGroupId && !!entry.intoReflectionGroupId && !!entry.sortOrderByReflectionId

/**
 * Undoes Accept all. Each card goes back to its original group and position only if it is still
 * where Accept all put it, and a receiving group gets its old title back only if nobody renamed it,
 * so whatever teammates did afterwards stays. Snapshots from the retired autogroup are just cleared.
 */
const resetReflectionGroups: MutationResolvers['resetReflectionGroups'] = async (
  _source,
  {meetingId}: {meetingId: string},
  context: GQLContext
) => {
  const {dataLoader, socketId: mutatorId} = context
  const meeting = await dataLoader.get('newMeetings').load(meetingId)

  if (!meeting) {
    throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  }
  if (meeting.meetingType !== 'retrospective') {
    throw new GraphQLError('Incorrect meeting type', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  if (meeting.endedAt || getPhase(meeting.phases, 'group')?.stages[0]?.isComplete) {
    throw new GraphQLError('Groups are locked once voting starts', {extensions: {code: 'CONFLICT'}})
  }
  const {resetReflectionGroups: snapshot} = meeting
  if (!snapshot) {
    throw new GraphQLError('There is nothing to undo', {extensions: {code: 'CONFLICT'}})
  }

  const entries = snapshot.filter(isExactSnapshotEntry)
  await getKysely()
    .transaction()
    .execute(async (trx) => {
      for (const entry of entries) {
        const current = await trx
          .selectFrom('RetroReflection')
          .select(['id', 'reflectionGroupId'])
          .where('id', 'in', entry.reflectionIds)
          .where('isActive', '=', true)
          .execute()
        const stillMoved = current.filter(
          ({reflectionGroupId}) => reflectionGroupId === entry.intoReflectionGroupId
        )
        if (stillMoved.length === 0) continue
        await trx
          .updateTable('RetroReflectionGroup')
          .set({isActive: true})
          .where('id', '=', entry.reflectionGroupId)
          .execute()
        for (const {id} of stillMoved) {
          await trx
            .updateTable('RetroReflection')
            .set({
              reflectionGroupId: entry.reflectionGroupId,
              sortOrder: entry.sortOrderByReflectionId[id] ?? 0
            })
            .where('id', '=', id)
            .execute()
        }
      }
      const retitled = new Map(
        entries
          .filter(({intoAppliedTitle}) => !!intoAppliedTitle)
          .map((entry) => [entry.intoReflectionGroupId, entry])
      )
      for (const [reflectionGroupId, entry] of retitled) {
        await trx
          .updateTable('RetroReflectionGroup')
          .set({title: entry.intoPriorTitle ?? null, smartTitle: entry.intoPriorSmartTitle ?? null})
          .where('id', '=', reflectionGroupId)
          .where('title', '=', entry.intoAppliedTitle!)
          .execute()
      }
      await trx
        .updateTable('NewMeeting')
        .set({resetReflectionGroups: null})
        .where('id', '=', meetingId)
        .execute()
    })

  dataLoader.clearAll(['newMeetings', 'retroReflections', 'retroReflectionGroups'])
  const data = {meetingId}
  const operationId = dataLoader.share()
  publish(SubscriptionChannel.MEETING, meetingId, 'ResetReflectionGroupsSuccess', data, {
    operationId,
    mutatorId
  })
  return data
}

export default resetReflectionGroups
