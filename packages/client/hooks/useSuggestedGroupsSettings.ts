import {useCallback} from 'react'
import type {SuggestedGroupsMode} from '../__generated__/useGenerateSuggestedGroupsMutation.graphql'
import useSessionStorageState from './useSessionStorageState'

export type SuggestedGroupsSettings = {
  mode: SuggestedGroupsMode
  userPrompt: string
  sameColumnOnly: boolean
}

/**
 * The draft starts out mirroring whatever is applied to the board, so the panel opens describing
 * the suggestions on screen (including the set the group phase generates on its own, which lands
 * after this mounts) rather than a default the viewer never chose. It only diverges once the
 * viewer changes something.
 *
 * Per-viewer, not shared with the team: the hover outline is inherently per-viewer, and applying
 * already broadcasts to everyone through the mutation.
 */
const useSuggestedGroupsSettings = (
  meetingId: string,
  appliedSettings: SuggestedGroupsSettings
) => {
  const [draft, setDraft] = useSessionStorageState<SuggestedGroupsSettings | null>(
    `SuggestedGroups:${meetingId}`,
    null
  )
  const {mode, userPrompt, sameColumnOnly} = appliedSettings

  const updateSettings = useCallback(
    (patch: Partial<SuggestedGroupsSettings>) => {
      setDraft((prev) => ({...(prev ?? {mode, userPrompt, sameColumnOnly}), ...patch}))
    },
    [setDraft, mode, userPrompt, sameColumnOnly]
  )

  return [draft ?? appliedSettings, updateSettings] as const
}

export default useSuggestedGroupsSettings
