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

export const findSuggestionForReflection = <T extends SuggestionGroup>(
  suggestions: readonly T[],
  reflectionId: string
) => suggestions.find((suggestion) => suggestion.reflectionIds.includes(reflectionId))
