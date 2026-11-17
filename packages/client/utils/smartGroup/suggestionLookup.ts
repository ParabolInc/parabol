/**
 * Maps stored group suggestions onto the board as it exists right now.
 * Suggestions name reflections, not groups, so a card dragged since they were generated is followed
 * to wherever it now lives instead of pointing at a group that no longer holds it.
 */

export type SuggestionGroup = {
  readonly reflectionIds: readonly string[]
}

export type BoardGroup = {
  readonly id: string
  readonly reflections: readonly {readonly id: string}[]
}

export const getGroupIdByReflectionId = (groups: readonly BoardGroup[]) => {
  const groupIdByReflectionId = new Map<string, string>()
  for (const group of groups) {
    for (const reflection of group.reflections) {
      groupIdByReflectionId.set(reflection.id, group.id)
    }
  }
  return groupIdByReflectionId
}

/** The board groups a suggestion would merge. Fewer than 2 means it is already satisfied */
export const getSuggestedGroupIds = (
  suggestion: SuggestionGroup,
  groupIdByReflectionId: Map<string, string>
) => {
  const groupIds = new Set<string>()
  for (const reflectionId of suggestion.reflectionIds) {
    const groupId = groupIdByReflectionId.get(reflectionId)
    if (groupId) groupIds.add(groupId)
  }
  return groupIds
}

/**
 * Every board group named by a suggestion that still spans 2+ groups.
 *
 * This is the set with something left to offer: a suggestion whose cards already sit together is
 * satisfied and points at nothing. Shared by the corner hint, which advertises a merge before the
 * viewer hovers, and the reveal flash, which announces a freshly generated set.
 */
export const getMergeableSuggestedGroupIds = (
  suggestions: readonly SuggestionGroup[] | null | undefined,
  groups: readonly BoardGroup[]
) => {
  const mergeableGroupIds = new Set<string>()
  if (!suggestions?.length) return mergeableGroupIds
  const groupIdByReflectionId = getGroupIdByReflectionId(groups)
  for (const suggestion of suggestions) {
    const groupIds = getSuggestedGroupIds(suggestion, groupIdByReflectionId)
    if (groupIds.size < 2) continue
    for (const groupId of groupIds) mergeableGroupIds.add(groupId)
  }
  return mergeableGroupIds
}

export const findSuggestionForReflection = <T extends SuggestionGroup>(
  suggestions: readonly T[],
  reflectionId: string
) => suggestions.find((suggestion) => suggestion.reflectionIds.includes(reflectionId))
