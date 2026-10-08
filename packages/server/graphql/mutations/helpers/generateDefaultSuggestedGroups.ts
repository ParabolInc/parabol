import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import getRedis from '../../../utils/getRedis'
import {Logger} from '../../../utils/Logger'
import publish from '../../../utils/publish'
import type {DataLoaderWorker} from '../../graphql'
import canAccessAI from './canAccessAI'
import computeSuggestedGroups from './computeSuggestedGroups'
import upsertSuggestedGrouping from './upsertSuggestedGrouping'

// Matches generateSuggestedGroups, since this can now hold the lock for a whole LLM run
const LOCK_TTL_MS = 60_000

const AI_CONFIG = {mode: 'ai' as const, userPrompt: null, sameColumnOnly: false}
const SIMILARITY_CONFIG = {mode: 'similarity' as const, userPrompt: null, sameColumnOnly: false}

/**
 * AI grouping when the team is entitled to it, similar wording otherwise. Similar wording is also
 * the fallback for an AI run that fails (provider down, timed out, no API key configured), since it
 * only reads embeddings the embedder already wrote and so still has an answer to give.
 */
const computeDefaultSuggestedGroups = async (
  meetingId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  if (await canAccessAI(team, dataLoader)) {
    try {
      const computed = await computeSuggestedGroups(meetingId, AI_CONFIG, dataLoader)
      return {...computed, config: AI_CONFIG}
    } catch (e) {
      Logger.warn(`AI could not suggest groups for meeting ${meetingId}, using similar wording`, e)
    }
  }
  const computed = await computeSuggestedGroups(meetingId, SIMILARITY_CONFIG, dataLoader)
  return {...computed, config: SIMILARITY_CONFIG}
}

/**
 * Suggests groups the moment a retro enters the group phase, so the hover outline and the Suggest
 * Groups panel are useful without anyone having to ask for them first.
 *
 * Fire-and-forget, and every failure is swallowed: a retro must never fail to advance out of the
 * reflect phase because suggestions could not be produced. Failing here just leaves suggestedGrouping
 * null, which the client renders as its pre-existing ambient hover behavior.
 *
 * Untracked on purpose: this fires once for every retro that reaches the group phase, so an event
 * here would measure how many retros there are rather than anything about grouping.
 */
const generateDefaultSuggestedGroups = async (
  meetingId: string,
  teamId: string,
  facilitatorUserId: string
) => {
  // The caller's dataLoader is disposed when its request ends, and this outlives that
  const dataLoader = getNewDataLoader('generateDefaultSuggestedGroups')
  const operationId = dataLoader.share()
  try {
    // Shared with generateSuggestedGroups: an LLM run takes long enough for someone to open the
    // panel and ask for their own set, and landing afterwards would silently replace it
    const redis = getRedis()
    const lockKey = `lock:suggestedGrouping:${meetingId}`
    const hasLock = await redis.set(lockKey, 'default', 'PX', LOCK_TTL_MS, 'NX')
    if (!hasLock) return

    try {
      const {config, groups, inputHash} = await computeDefaultSuggestedGroups(
        meetingId,
        teamId,
        dataLoader
      )
      // Stored even when empty: "we looked and nothing was similar enough" is an answer, and it
      // keeps the panel from offering to regenerate the identical result
      await upsertSuggestedGrouping(
        {...config, meetingId, createdByUserId: facilitatorUserId, inputHash, groups},
        dataLoader
      )

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
    Logger.warn(`Unable to suggest groups for meeting ${meetingId}`, e)
  } finally {
    dataLoader.dispose()
  }
}

export default generateDefaultSuggestedGroups
