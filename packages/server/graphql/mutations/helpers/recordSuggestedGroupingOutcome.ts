import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {selectRetroSuggestedGrouping} from '../../../postgres/select'
import {Logger} from '../../../utils/Logger'
import countMovedReflections from './countMovedReflections'

/**
 * Records, when the group phase ends, how far the team's grouping ended up from the suggestions,
 * so suggestion quality can be measured against what people actually kept.
 */
const recordSuggestedGroupingOutcome = async (meetingId: string) => {
  try {
    const pg = getKysely()
    const [suggestedGrouping, reflections] = await Promise.all([
      selectRetroSuggestedGrouping().where('meetingId', '=', meetingId).executeTakeFirst(),
      pg
        .selectFrom('RetroReflection')
        .select(['id', 'reflectionGroupId'])
        .where('meetingId', '=', meetingId)
        .where('isActive', '=', true)
        .execute()
    ])
    if (!suggestedGrouping) return
    const suggestedGroupKeyById = new Map(
      suggestedGrouping.groups.flatMap(({reflectionIds}, idx) =>
        reflectionIds.map((id) => [id, String(idx)] as const)
      )
    )
    const movedReflectionCount = countMovedReflections(
      reflections.map(({id, reflectionGroupId}) => ({
        suggestedGroupKey: suggestedGroupKeyById.get(id) ?? `unsuggested:${id}`,
        finalGroupKey: reflectionGroupId
      }))
    )
    await pg
      .updateTable('RetroSuggestedGrouping')
      .set({
        groupPhaseCompletedAt: sql`CURRENT_TIMESTAMP`,
        finalReflectionCount: reflections.length,
        movedReflectionCount
      })
      .where('meetingId', '=', meetingId)
      .execute()
  } catch (e) {
    Logger.warn(`Unable to record the suggested grouping outcome for meeting ${meetingId}`, e)
  }
}

export default recordSuggestedGroupingOutcome
