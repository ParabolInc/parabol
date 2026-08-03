import {GraphQLError} from 'graphql'
import type {AutogroupReflectionGroupType, RetroReflection} from '../../../postgres/types'
import {Logger} from '../../../utils/Logger'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import type {DataLoaderWorker} from '../../graphql'

const LLM_TIMEOUT_MS = 45_000

type Options = {
  userPrompt?: string | null
  sameColumnOnly?: boolean
}

type Result = {
  groups: AutogroupReflectionGroupType[]
  promptCount: number
  tokenCost: number
}

/**
 * Groups a retro's reflections with an LLM.
 *
 * Throws a GraphQLError when every batch fails, so the client can surface the reason in a
 * snackbar. Nothing is persisted for a failed run.
 *
 * When sameColumnOnly is set we make one call per reflect prompt in parallel rather than asking a
 * single call to respect a column boundary. Splitting a cross-column group after the fact would
 * leave it with a title describing the merged theme and would break the group-count target the
 * prompt just set, whereas per-column calls make a cross-column group structurally impossible.
 * It is also faster (the slowest column, not the sum) and isolates failures: today a single
 * hallucinated id discards the whole batch, but per-column only that column degrades to singletons.
 */
const computeAISuggestedGroups = async (
  reflections: RetroReflection[],
  dataLoader: DataLoaderWorker,
  options: Options = {}
): Promise<Result> => {
  const {userPrompt, sameColumnOnly} = options
  // The group phase can hold an empty card, since removeEmptyReflections only runs on transitions.
  // Filter before building the input: the exactly-once validator is defined over the input set,
  // so there is no way to drop them afterwards.
  const groupable = reflections.filter(({plaintextContent}) => !!plaintextContent.trim())
  if (groupable.length === 0) {
    throw new GraphQLError('There are no reflections to group')
  }

  const promptIds = [...new Set(groupable.map((r) => r.promptId))]
  const prompts = await Promise.all(
    promptIds.map((id) => dataLoader.get('reflectPrompts').loadNonNull(id))
  )
  const promptMap = new Map(prompts.map((p) => [p.id, p.question]))

  /**
   * A batch confined to one column names its question once; a batch spanning columns has to spell
   * out which prompt each card answers. Picking the smaller shape is worth real latency, since the
   * question would otherwise be repeated on every line.
   */
  const toInput = (promptId: string | null, batch: RetroReflection[]) =>
    promptId
      ? {
          prompt: promptMap.get(promptId) ?? '',
          reflections: batch.map(({id, plaintextContent}) => ({id, text: plaintextContent}))
        }
      : {
          reflections: batch.map((r) => ({
            id: r.id,
            text: r.plaintextContent,
            prompt: promptMap.get(r.promptId) ?? ''
          }))
        }

  const manager = new OpenAIServerManager()
  // One batch per column when constrained, otherwise a single batch over the whole board. A board
  // with only one reflect prompt is scoped either way: there is no second column to group across,
  // so the cross-column shape would just repeat the same question on every line.
  const batches =
    sameColumnOnly || promptIds.length === 1
      ? promptIds.map((promptId) => ({
          promptId,
          reflections: groupable.filter((r) => r.promptId === promptId)
        }))
      : [{promptId: null, reflections: groupable}]

  const results = await Promise.all(
    batches.map(async ({promptId, reflections: batch}) => {
      const first = batch[0]
      if (!first) return null
      // A batch of one is already its own group, so there is nothing to ask. Scoped batches hit
      // this whenever a column holds a single card; the cross-column batch only when the whole
      // board does.
      if (batch.length === 1) {
        return {groups: [{title: '', reflectionIds: [first.id]}], tokenCost: 0}
      }
      return manager.groupReflectionsStructured(toInput(promptId, batch), {
        userPrompt,
        signal: AbortSignal.timeout(LLM_TIMEOUT_MS)
      })
    })
  )

  const groups: AutogroupReflectionGroupType[] = []
  let tokenCost = 0
  let failedBatches = 0
  results.forEach((result, idx) => {
    const batch = batches[idx]!
    if (!result) {
      failedBatches++
      Logger.warn(
        `OpenAI was unable to group ${batch.reflections.length} reflections${
          batch.promptId ? ` for prompt ${batch.promptId}` : ''
        }`
      )
      // Degrade this column to singletons rather than discarding every other column's work
      groups.push(...batch.reflections.map(({id}) => ({groupTitle: '', reflectionIds: [id]})))
      return
    }
    tokenCost += result.tokenCost
    groups.push(
      ...result.groups.map(({title, reflectionIds}) => ({groupTitle: title, reflectionIds}))
    )
  })

  if (failedBatches === batches.length) {
    throw new GraphQLError(
      "AI wasn't able to group these reflections. Try again, or use Similar Wording."
    )
  }
  return {
    groups: dedupeTitles(groups),
    promptCount: promptIds.length,
    tokenCost
  }
}

/**
 * Per-column calls each pick titles independently, so the same theme can surface twice.
 * Titles must stay distinct for the discuss phase to be navigable.
 */
const dedupeTitles = (groups: AutogroupReflectionGroupType[]) => {
  const seen = new Set<string>()
  return groups.map((group) => {
    const {groupTitle} = group
    if (!groupTitle) return group
    const key = groupTitle.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      return group
    }
    for (let suffix = 2; ; suffix++) {
      const candidate = `${groupTitle} ${suffix}`
      if (!seen.has(candidate.toLowerCase())) {
        seen.add(candidate.toLowerCase())
        return {...group, groupTitle: candidate}
      }
    }
  })
}

export default computeAISuggestedGroups
