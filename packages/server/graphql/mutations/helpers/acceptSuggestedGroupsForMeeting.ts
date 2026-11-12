import isGroupTitleUserDefined from 'parabol-client/utils/smartGroup/isGroupTitleUserDefined'
import planSuggestedGroupMerges from 'parabol-client/utils/smartGroup/planSuggestedGroupMerges'
import getKysely from '../../../postgres/getKysely'
import {selectRetroSuggestedGrouping} from '../../../postgres/select'
import type {ResetReflectionGroupType} from '../../../postgres/types'
import type {DataLoaderWorker} from '../../graphql'
import updateGroupTitle from './updateGroupTitle'

/**
 * Applies every suggestion the planner accepts in one transaction and snapshots exactly what moved,
 * so resetReflectionGroups can put back only the cards still where this left them.
 * The caller holds the meeting's suggestion lock, so the stored set cannot change underneath it.
 */
const acceptSuggestedGroupsForMeeting = async (meetingId: string, dataLoader: DataLoaderWorker) => {
  const {merges, untitledTargets} = await getKysely()
    .transaction()
    .execute(async (trx) => {
      const suggestedGrouping = await selectRetroSuggestedGrouping()
        .where('meetingId', '=', meetingId)
        .executeTakeFirst()
      const groups = await trx
        .selectFrom('RetroReflectionGroup')
        .select(['id', 'title', 'smartTitle', 'sortOrder'])
        .where('meetingId', '=', meetingId)
        .where('isActive', '=', true)
        .forUpdate()
        .execute()
      const reflections = await trx
        .selectFrom('RetroReflection')
        .select(['id', 'reflectionGroupId', 'sortOrder', 'plaintextContent'])
        .where('meetingId', '=', meetingId)
        .where('isActive', '=', true)
        .orderBy('sortOrder')
        .forUpdate()
        .execute()
      if (!suggestedGrouping) return {merges: [], untitledTargets: []}

      const board = groups.map((group) => ({
        ...group,
        titleIsUserDefined: isGroupTitleUserDefined(group),
        reflections: reflections.filter(({reflectionGroupId}) => reflectionGroupId === group.id)
      }))
      const boardById = new Map(board.map((group) => [group.id, group]))
      const merges = planSuggestedGroupMerges(
        suggestedGrouping.groups.map(({groupTitle, reflectionIds}) => ({
          title: groupTitle || null,
          reflectionIds
        })),
        board
      )

      const snapshot: ResetReflectionGroupType[] = []
      const untitledTargets: {
        reflectionGroupId: string
        reflections: {plaintextContent: string}[]
      }[] = []
      for (const {targetGroupId, sourceGroupIds, title} of merges) {
        const target = boardById.get(targetGroupId)!
        let sortOrder = Math.max(0, ...target.reflections.map((r) => r.sortOrder))
        for (const sourceGroupId of sourceGroupIds) {
          const source = boardById.get(sourceGroupId)!
          for (const reflection of source.reflections) {
            sortOrder += 1
            await trx
              .updateTable('RetroReflection')
              .set({reflectionGroupId: targetGroupId, sortOrder})
              .where('id', '=', reflection.id)
              .execute()
          }
          await trx
            .updateTable('RetroReflectionGroup')
            .set({isActive: false})
            .where('id', '=', sourceGroupId)
            .execute()
          snapshot.push({
            groupTitle: source.title ?? '',
            reflectionIds: source.reflections.map(({id}) => id),
            reflectionGroupId: sourceGroupId,
            intoReflectionGroupId: targetGroupId,
            sortOrderByReflectionId: Object.fromEntries(
              source.reflections.map(({id, sortOrder}) => [id, sortOrder])
            ),
            intoPriorTitle: target.title,
            intoPriorSmartTitle: target.smartTitle,
            intoAppliedTitle: title
          })
        }
        if (title) {
          await trx
            .updateTable('RetroReflectionGroup')
            .set({title, smartTitle: title})
            .where('id', '=', targetGroupId)
            .execute()
        } else if (!target.titleIsUserDefined) {
          untitledTargets.push({
            reflectionGroupId: targetGroupId,
            reflections: [
              ...target.reflections,
              ...sourceGroupIds.flatMap((id) => boardById.get(id)!.reflections)
            ]
          })
        }
      }
      if (merges.length > 0) {
        await trx
          .updateTable('NewMeeting')
          .set({resetReflectionGroups: JSON.stringify(snapshot)})
          .where('id', '=', meetingId)
          .execute()
      }
      return {merges, untitledTargets}
    })

  dataLoader.clearAll(['newMeetings', 'retroReflections', 'retroReflectionGroups'])
  if (untitledTargets.length > 0) {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    await Promise.all(
      untitledTargets.map(({reflectionGroupId, reflections}) =>
        updateGroupTitle({
          reflections,
          reflectionGroupId,
          meetingId,
          teamId: meeting.teamId,
          dataLoader
        })
      )
    )
  }
  return merges.length
}

export default acceptSuggestedGroupsForMeeting
