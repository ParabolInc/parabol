import {useEffect, useRef, useState} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {
  type BoardGroup,
  getMergeableSuggestedGroupIds,
  type SuggestionGroup
} from '../utils/smartGroup/suggestionLookup'
import useAtmosphere from './useAtmosphere'

const REVEAL_DURATION_MS = 1500

/**
 * Flashes an outline on every group that has a match, once, when a fresh set of suggestions lands.
 *
 * Hover outlines are ambient, so pressing "Update suggestions" would otherwise appear to do
 * nothing. This makes the click visibly answer the question and teaches the hover affordance at the
 * same time. Reuses the same Relay field as the hover outline, so no extra rendering code is
 * involved.
 *
 * Driven by revealAt, which is only stamped for suggestions a person asked for. The server also
 * refreshes similarity suggestions whenever a reflection is added or edited, and flashing those
 * would set the board blinking every time anyone touched a card.
 *
 * Suggestions that were applied to the board need no reveal, and get none for free: once the cards
 * are merged, every suggestion resolves to a single group and is skipped below.
 *
 * Returns true while a reveal is on screen, so the "N similar" scroll indicators can stay quiet
 * rather than reporting the whole board.
 */
const useSuggestedGroupsReveal = (
  reflectionGroups: readonly BoardGroup[],
  suggestions: readonly SuggestionGroup[] | null | undefined,
  revealAt: string | null | undefined
) => {
  const atmosphere = useAtmosphere()
  const [isRevealing, setIsRevealing] = useState(false)
  const lastRevealedRef = useRef<string | null>(null)
  // Read through refs so the effect fires on a new generation only, never on an unrelated re-render
  const groupsRef = useRef(reflectionGroups)
  groupsRef.current = reflectionGroups
  const suggestionsRef = useRef(suggestions)
  suggestionsRef.current = suggestions

  useEffect(() => {
    if (!revealAt) return
    // Don't re-flash the same suggestions when remounting or navigating back
    if (lastRevealedRef.current === null) {
      lastRevealedRef.current = revealAt
      return
    }
    if (lastRevealedRef.current === revealAt) return
    lastRevealedRef.current = revealAt

    const currentSuggestions = suggestionsRef.current
    if (!currentSuggestions?.length) return
    const matchedGroupIds = getMergeableSuggestedGroupIds(currentSuggestions, groupsRef.current)
    if (matchedGroupIds.size === 0) return

    setIsRevealing(true)
    commitLocalUpdate(atmosphere, (store) => {
      for (const groupId of matchedGroupIds) {
        store.get(groupId)?.setValue(1, 'activeReflectionGroupSimilarity')
      }
    })
    const timeout = setTimeout(() => {
      setIsRevealing(false)
      commitLocalUpdate(atmosphere, (store) => {
        for (const groupId of matchedGroupIds) {
          store.get(groupId)?.setValue(null, 'activeReflectionGroupSimilarity')
        }
      })
    }, REVEAL_DURATION_MS)
    return () => clearTimeout(timeout)
  }, [revealAt, atmosphere])

  return isRevealing
}

export default useSuggestedGroupsReveal
