import {useCallback} from 'react'
import type {SuggestedGroupsMode} from '../__generated__/useGenerateSuggestedGroupsMutation.graphql'
import useSessionStorageState from './useSessionStorageState'

export type SuggestedGroupsSettings = {
  mode: SuggestedGroupsMode
  userPrompt: string
  sameColumnOnly: boolean
}

/**
 * Today's ambient behavior: match cards by wording, anywhere on the board, hover to discover.
 * Everything else is opt-in. Applying the dialog only changes what hovering shows — grouping
 * itself happens from the "Group" button that appears on the hovered card.
 */
export const DEFAULT_SUGGESTED_GROUPS_SETTINGS: SuggestedGroupsSettings = {
  mode: 'similarity',
  userPrompt: '',
  sameColumnOnly: false
}

/**
 * Per-viewer, not shared with the team: the hover outline is inherently per-viewer, and applying
 * already broadcasts to everyone through the mutation.
 */
const useSuggestedGroupsSettings = (meetingId: string) => {
  const [settings, setSettings] = useSessionStorageState<SuggestedGroupsSettings>(
    `SuggestedGroups:${meetingId}`,
    DEFAULT_SUGGESTED_GROUPS_SETTINGS
  )

  const updateSettings = useCallback(
    (patch: Partial<SuggestedGroupsSettings>) => {
      setSettings((prev) => ({...prev, ...patch}))
    },
    [setSettings]
  )

  return [settings, updateSettings, setSettings] as const
}

export default useSuggestedGroupsSettings
