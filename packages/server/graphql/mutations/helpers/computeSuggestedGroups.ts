import {createHash} from 'crypto'
import type {
  AutogroupReflectionGroupType,
  RetroSuggestedGrouping,
  SuggestedGroupsModeType
} from '../../../postgres/types'
import type {DataLoaderWorker} from '../../graphql'
import computeAISuggestedGroups from './computeAISuggestedGroups'
import computeSimilaritySuggestedGroups from './computeSimilaritySuggestedGroups'

export type ComputeSuggestedGroupsConfig = {
  mode: SuggestedGroupsModeType
  userPrompt: string | null
  sameColumnOnly: boolean
}

export type ComputedSuggestedGroups = {
  groups: AutogroupReflectionGroupType[]
  inputHash: string
  /** True when a stored result was reused, so no LLM call was made */
  cacheHit: boolean
  reflectionCount: number
  promptCount: number
  tokenCost: number
}

/**
 * Identifies the exact set of cards a grouper saw. Sorted so that reordering the board, which does
 * not change what there is to group, still hits the stored result.
 */
export const hashReflectionIds = (reflectionIds: readonly string[]) =>
  createHash('sha256')
    .update([...reflectionIds].sort().join(','))
    .digest('hex')

/** True when the stored set was produced by this exact config over these exact cards */
const isReusable = (
  stored: RetroSuggestedGrouping | null,
  config: ComputeSuggestedGroupsConfig,
  inputHash: string
) =>
  !!stored &&
  stored.mode === config.mode &&
  (stored.userPrompt ?? null) === config.userPrompt &&
  stored.sameColumnOnly === config.sameColumnOnly &&
  stored.inputHash === inputHash

/**
 * Produces suggested groups for a retro, reusing the stored result when it was produced by an
 * equivalent request.
 *
 * Similarity grouping is derived from embeddings the embedder already wrote as reflections were
 * typed, so it is cheap enough to run automatically on entering the group phase. AI grouping costs
 * an LLM call, so it is only computed when a user asks for it.
 *
 * The cache is the meeting's RetroSuggestedGrouping row, keyed on the full config plus a hash of the
 * live reflection ids, so previewing on hover and then applying costs one LLM call rather than two.
 *
 * Throws a GraphQLError when the grouper cannot produce an answer.
 */
const computeSuggestedGroups = async (
  meetingId: string,
  config: ComputeSuggestedGroupsConfig,
  dataLoader: DataLoaderWorker
): Promise<ComputedSuggestedGroups> => {
  const {mode, userPrompt, sameColumnOnly} = config
  const [reflections, stored] = await Promise.all([
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('retroSuggestedGroupingByMeetingId').load(meetingId)
  ])
  const inputHash = hashReflectionIds(reflections.map(({id}) => id))
  const base = {inputHash, reflectionCount: reflections.length, promptCount: 0, tokenCost: 0}

  if (isReusable(stored, config, inputHash)) {
    return {...base, groups: stored!.groups, cacheHit: true}
  }

  if (mode === 'similarity') {
    const groups = await computeSimilaritySuggestedGroups(meetingId, sameColumnOnly, dataLoader)
    return {...base, groups, cacheHit: false}
  }

  const {groups, promptCount, tokenCost} = await computeAISuggestedGroups(reflections, dataLoader, {
    userPrompt,
    sameColumnOnly
  })
  return {...base, groups, cacheHit: false, promptCount, tokenCost}
}

export default computeSuggestedGroups
