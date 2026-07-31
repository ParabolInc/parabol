import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import {Logger} from '../../../utils/Logger'
import publish from '../../../utils/publish'
import computeSuggestedGroups from './computeSuggestedGroups'
import upsertSuggestedGrouping from './upsertSuggestedGrouping'

/**
 * Suggests groups by similar wording the moment a retro enters the group phase, so the hover
 * outline and the Suggest Groups panel are useful without anyone having to ask for them first.
 *
 * Deliberately similarity-only: it reads embeddings the embedder already wrote while reflections
 * were being typed, so it costs no LLM call and works for orgs that have AI turned off. AI grouping
 * stays user-initiated, since it does cost money.
 *
 * Fire-and-forget, and every failure is swallowed: a retro must never fail to advance out of the
 * reflect phase because suggestions could not be produced. Failing here just leaves suggestedGrouping
 * null, which the client renders as its pre-existing ambient hover behavior.
 *
 * Untracked on purpose: this fires once for every retro that reaches the group phase, so an event
 * here would measure how many retros there are rather than anything about grouping.
 */
const generateDefaultSuggestedGroups = async (meetingId: string, facilitatorUserId: string) => {
  // The caller's dataLoader is disposed when its request ends, and this outlives that
  const dataLoader = getNewDataLoader('generateDefaultSuggestedGroups')
  const operationId = dataLoader.share()
  try {
    const config = {mode: 'similarity' as const, userPrompt: null, sameColumnOnly: false}
    const {groups, inputHash} = await computeSuggestedGroups(meetingId, config, dataLoader)
    // Stored even when empty: "we looked and nothing was similar enough" is an answer, and it keeps
    // the panel from offering to regenerate the identical result
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
  } catch (e) {
    Logger.warn(`Unable to suggest groups for meeting ${meetingId}`, e)
  } finally {
    dataLoader.dispose()
  }
}

export default generateDefaultSuggestedGroups
