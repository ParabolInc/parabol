import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import getPhase from '../../../utils/getPhase'
import getRedis from '../../../utils/getRedis'
import {Logger} from '../../../utils/Logger'
import publish from '../../../utils/publish'
import computeSimilaritySuggestedGroups from './computeSimilaritySuggestedGroups'
import {hashReflectionIds} from './computeSuggestedGroups'
import upsertSuggestedGrouping from './upsertSuggestedGrouping'

// Short: this only reads embeddings and does arithmetic, so a holder that outlives this is stuck
const LOCK_TTL_MS = 10_000

/**
 * Recomputes a meeting's similarity suggestions once a reflection's embedding lands, so the hover
 * outline accounts for the card that was just written instead of quietly ignoring it. The client
 * has no vectors of its own, so a suggestion set that is never refreshed is simply wrong until
 * someone reopens the panel.
 *
 * Only similarity meetings are refreshed. AI grouping costs an LLM call per run, so an edited card
 * leaves those suggestions stale on purpose — SuggestedGroups.isStale reports that, and the panel
 * turns "Update suggestions" back on so a human can decide whether the answer is worth paying for.
 *
 * Fire-and-forget: this runs off the back of a reflection mutation that has already returned, and a
 * refresh that cannot be produced is not worth surfacing. Failing here leaves the previous
 * suggestions in place, which are stale rather than wrong.
 */
const refreshSuggestedGroups = async (meetingId: string) => {
  // The caller's dataLoader is disposed when its request ends, and this outlives that. A fresh one
  // also guarantees the reflection and the embedding just written are both read back.
  const dataLoader = getNewDataLoader('refreshSuggestedGroups')
  try {
    const [meeting, stored] = await Promise.all([
      dataLoader.get('newMeetings').load(meetingId),
      dataLoader.get('retroSuggestedGroupingByMeetingId').load(meetingId)
    ])
    // Nothing stored yet means the group phase has not started, and generateDefaultSuggestedGroups
    // will compute the first set from every card at once
    if (!stored || stored.mode !== 'similarity') return
    if (!meeting || meeting.endedAt) return
    const groupPhase = getPhase(meeting.phases, 'group')
    if (groupPhase?.stages[0]?.isComplete) return

    // Shared with generateSuggestedGroups so a refresh cannot overwrite a set a user asked for
    // between its computation and its store. Skipped rather than queued: whoever holds the lock is
    // about to publish a newer set anyway, and a queued refresh would only add a redundant one.
    const redis = getRedis()
    const lockKey = `lock:suggestedGrouping:${meetingId}`
    const hasLock = await redis.set(lockKey, 'refresh', 'PX', LOCK_TTL_MS, 'NX')
    if (!hasLock) return

    try {
      // Re-read under the lock. A user's AI run can finish in the gap between the check above and
      // this lock, and refreshing on top of it would silently throw away an answer they paid for.
      dataLoader.get('retroSuggestedGroupingByMeetingId').clear(meetingId)
      const current = await dataLoader.get('retroSuggestedGroupingByMeetingId').load(meetingId)
      if (current?.mode !== 'similarity') return
      const {sameColumnOnly, createdByUserId} = current
      // Called directly rather than through computeSuggestedGroups, whose cache is keyed on the set
      // of reflection ids: an edit leaves those ids untouched, so the cache would report a hit and
      // hand back the very suggestions this refresh exists to replace.
      const groups = await computeSimilaritySuggestedGroups(meetingId, sameColumnOnly, dataLoader)
      const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
      await upsertSuggestedGrouping(
        {
          meetingId,
          mode: 'similarity',
          userPrompt: null,
          sameColumnOnly,
          // Whoever chose these settings still owns them; a refresh is not an authorship event
          createdByUserId,
          inputHash: hashReflectionIds(reflections.map(({id}) => id)),
          groups
        },
        dataLoader
      )

      const operationId = dataLoader.share()
      // No mutatorId: the viewer whose card triggered this needs the new outline as much as anyone
      publish(
        SubscriptionChannel.MEETING,
        meetingId,
        'SuggestedGroupsSuccess',
        {meetingId, isUserInitiated: false},
        {operationId}
      )
    } finally {
      await redis.del(lockKey)
    }
  } catch (e) {
    Logger.warn(`Unable to refresh suggested groups for meeting ${meetingId}`, e)
  } finally {
    dataLoader.dispose()
  }
}

export default refreshSuggestedGroups
