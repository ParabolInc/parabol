import {useCallback, useRef} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {
  type BoardGroup,
  findSuggestionForReflection,
  getGroupIdByReflectionId,
  getSuggestedGroupIds,
  type SuggestionGroup
} from '../utils/smartGroup/suggestionLookup'
import useAtmosphere from './useAtmosphere'

/**
 * 'group' answers for the whole stack the reflection sits in, 'card' for that reflection alone.
 * A stack only ever hovers its top card, so a hover has to speak for its neighbors; a drag is about
 * the one card in flight, and would mislead if it lit up what the cards left behind belong to.
 */
export type HoverIntent = 'group' | 'card'

/**
 * Outlines what hovering a card would merge, by reading the meeting's stored suggestions.
 *
 * Both grouping modes answer from the same stored set, so what the outline promises is what the
 * grouper decided — the client never re-derives an answer of its own. The server keeps similarity
 * suggestions current as reflections are added and edited, which is what makes a stored set safe to
 * trust while the board is still moving.
 */
const useHoverSuggestedGroup = (
  reflectionGroups: readonly BoardGroup[],
  isGroupPhase: boolean,
  suggestions: readonly SuggestionGroup[] | null | undefined
) => {
  const atmosphere = useAtmosphere()
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useCallback(
    (reflectionId: string | null, intent: HoverIntent) => {
      const clearAll = () => {
        commitLocalUpdate(atmosphere, (store) => {
          for (const group of reflectionGroups) {
            store.get(group.id)?.setValue(null, 'activeReflectionGroupSimilarity')
          }
        })
      }

      if (!reflectionId || !isGroupPhase) {
        clearTimerRef.current = setTimeout(clearAll, 0)
        return
      }
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current)
        clearTimerRef.current = null
      }

      const sourceGroup = reflectionGroups.find((group) =>
        group.reflections.some((r) => r.id === reflectionId)
      )
      if (!sourceGroup) {
        clearAll()
        return
      }

      // Hovering a stack shows what the whole stack would merge with: the card on top needn't be
      // the one the grouper named, and a badge on a stack has to answer for every card under it
      const sourceReflectionIds =
        intent === 'group' ? sourceGroup.reflections.map(({id}) => id) : [reflectionId]
      const groupIdByReflectionId = getGroupIdByReflectionId(reflectionGroups)
      const targetGroupIds = new Set<string>()
      for (const sourceReflectionId of sourceReflectionIds) {
        const suggestion = suggestions?.length
          ? findSuggestionForReflection(suggestions, sourceReflectionId)
          : undefined
        if (!suggestion) continue
        for (const groupId of getSuggestedGroupIds(suggestion, groupIdByReflectionId)) {
          if (groupId !== sourceGroup.id) targetGroupIds.add(groupId)
        }
      }

      commitLocalUpdate(atmosphere, (store) => {
        for (const group of reflectionGroups) {
          store.get(group.id)?.setValue(null, 'activeReflectionGroupSimilarity')
        }
        // A suggestion whose cards already sit together has nothing left to offer
        if (targetGroupIds.size === 0) return
        // -1 sentinel marks the hovered source group (shows ring, no badge)
        store.get(sourceGroup.id)?.setValue(-1, 'activeReflectionGroupSimilarity')
        for (const groupId of targetGroupIds) {
          store.get(groupId)?.setValue(1, 'activeReflectionGroupSimilarity')
        }
      })
    },
    [reflectionGroups, atmosphere, isGroupPhase, suggestions]
  )
}

export default useHoverSuggestedGroup
