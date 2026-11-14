import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import type {ResetReflectionGroupType} from '../../../postgres/types'
import {getUserId} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
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
  const {authToken, dataLoader, socketId: mutatorId} = context
  const viewerId = getUserId(authToken)
  const meeting = await dataLoader.get('newMeetings').load(meetingId)

  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }
  if (meeting.meetingType !== 'retrospective') {
    return standardError(new Error('Incorrect meeting type'), {userId: viewerId})
  }
  if (meeting.endedAt || getPhase(meeting.phases, 'group')?.stages[0]?.isComplete) {
    return standardError(new Error('Groups are locked once voting starts'), {userId: viewerId})
  }
  const {resetReflectionGroups: snapshot} = meeting
  if (!snapshot) {
    return standardError(new Error('There is nothing to undo'), {userId: viewerId})
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
