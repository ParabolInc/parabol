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
    (reflectionId: string | null) => {
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

      const suggestion = suggestions?.length
        ? findSuggestionForReflection(suggestions, reflectionId)
        : undefined
      if (!suggestion) {
        clearAll()
        return
      }
      const targetGroupIds = getSuggestedGroupIds(
        suggestion,
        getGroupIdByReflectionId(reflectionGroups)
      )
      targetGroupIds.delete(sourceGroup.id)

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
