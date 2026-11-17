import {getGroupIdByReflectionId, getSuggestedGroupIds} from './suggestionLookup'

export type MergeableSuggestion = {
  readonly title?: string | null
  readonly reflectionIds: readonly string[]
}

export type MergeableGroup = {
  readonly id: string
  readonly titleIsUserDefined: boolean
  readonly sortOrder: number
  readonly reflections: readonly {readonly id: string}[]
}

export type SuggestedGroupMerge = {
  targetGroupId: string
  sourceGroupIds: string[]
  /** Null when the target keeps the title the team gave it, or the grouper wrote none */
  title: string | null
}

/**
 * Decides which suggestions Accept all can apply without undoing work people did by hand.
 * A stack the suggestion only partly covers would have to be split, and two team-titled stacks
 * would lose a name, so both leave the suggestion for one-at-a-time grouping.
 */
const planSuggestedGroupMerges = (
  suggestions: readonly MergeableSuggestion[],
  groups: readonly MergeableGroup[]
) => {
  const groupById = new Map(groups.map((group) => [group.id, group]))
  const groupIdByReflectionId = getGroupIdByReflectionId(groups)
  const merges: SuggestedGroupMerge[] = []
  for (const suggestion of suggestions) {
    const suggestedIds = new Set(suggestion.reflectionIds)
    const stacks = [...getSuggestedGroupIds(suggestion, groupIdByReflectionId)].map(
      (id) => groupById.get(id)!
    )
    if (stacks.length < 2) continue
    if (!stacks.every((stack) => stack.reflections.every(({id}) => suggestedIds.has(id)))) continue
    const titledStacks = stacks.filter(({titleIsUserDefined}) => titleIsUserDefined)
    if (titledStacks.length > 1) continue
    const target =
      titledStacks[0] ??
      [...stacks].sort(
        (a, b) => b.reflections.length - a.reflections.length || a.sortOrder - b.sortOrder
      )[0]!
    merges.push({
      targetGroupId: target.id,
      sourceGroupIds: stacks.filter((stack) => stack !== target).map(({id}) => id),
      title: titledStacks.length > 0 ? null : suggestion.title || null
    })
  }
  return merges
}

export default planSuggestedGroupMerges
