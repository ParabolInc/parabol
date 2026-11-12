import getKysely from '../../../postgres/getKysely'
import type {
  AutogroupReflectionGroupType,
  RetroSuggestedGrouping,
  SuggestedGroupsModeType
} from '../../../postgres/types'
import type {DataLoaderWorker} from '../../graphql'
import type {SuggestedGroupsRunTelemetry} from './computeSuggestedGroups'

type SuggestedGroupsInsert = SuggestedGroupsRunTelemetry & {
  meetingId: string
  createdByUserId: string
  /** Differs from mode when an AI run failed and similar wording stood in */
  requestedMode: SuggestedGroupsModeType
  mode: SuggestedGroupsModeType
  userPrompt: string | null
  sameColumnOnly: boolean
  inputHash: string
  groups: AutogroupReflectionGroupType[]
}

/**
 * Stores the meeting's one active set of suggested groups, replacing whatever was there before,
 * and primes the loader so the caller's own response reflects the write.
 * createdAt is left to the column default, per the convention that the database owns timestamps.
 */
const upsertSuggestedGrouping = async (
  row: SuggestedGroupsInsert,
  dataLoader: DataLoaderWorker
): Promise<RetroSuggestedGrouping> => {
  const {groups, ...rest} = row
  const stored = await getKysely()
    .insertInto('RetroSuggestedGrouping')
    .values({...rest, groups: JSON.stringify(groups)})
    .onConflict((oc) =>
      oc.column('meetingId').doUpdateSet((eb) => ({
        createdAt: eb.ref('excluded.createdAt'),
        createdByUserId: eb.ref('excluded.createdByUserId'),
        requestedMode: eb.ref('excluded.requestedMode'),
        mode: eb.ref('excluded.mode'),
        userPrompt: eb.ref('excluded.userPrompt'),
        sameColumnOnly: eb.ref('excluded.sameColumnOnly'),
        inputHash: eb.ref('excluded.inputHash'),
        groups: eb.ref('excluded.groups'),
        model: eb.ref('excluded.model'),
        reasoningEffort: eb.ref('excluded.reasoningEffort'),
        tokenCost: eb.ref('excluded.tokenCost'),
        repairedReflectionCount: eb.ref('excluded.repairedReflectionCount'),
        groupPhaseCompletedAt: null,
        finalReflectionCount: null,
        movedReflectionCount: null
      }))
    )
    .returning('createdAt')
    .executeTakeFirstOrThrow()

  const suggestedGrouping: RetroSuggestedGrouping = {
    ...row,
    createdAt: stored.createdAt,
    groupPhaseCompletedAt: null,
    finalReflectionCount: null,
    movedReflectionCount: null
  }
  dataLoader
    .get('retroSuggestedGroupingByMeetingId')
    .clear(row.meetingId)
    .prime(row.meetingId, suggestedGrouping)
  return suggestedGrouping
}

export default upsertSuggestedGrouping
