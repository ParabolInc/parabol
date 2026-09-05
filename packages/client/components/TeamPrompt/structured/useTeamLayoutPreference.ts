import {useCallback, useEffect, useRef, useState} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'

export type TeamLayout = 'grid' | 'feed' | 'byQuestion'
const STORAGE_KEY = 'standup:teamLayout'
const LAYOUTS: TeamLayout[] = ['grid', 'feed', 'byQuestion']
const TRACK_DELAY_MS = 700

const readLayout = (): TeamLayout => {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return LAYOUTS.includes(stored as TeamLayout) ? (stored as TeamLayout) : 'grid'
}

const useTeamLayoutPreference = (meetingId: string, teamId: string) => {
  const atmosphere = useAtmosphere()
  const [layout, setLayoutState] = useState<TeamLayout>(readLayout)
  const trackTimeoutRef = useRef(0)
  useEffect(() => () => window.clearTimeout(trackTimeoutRef.current), [])
  const setLayout = useCallback(
    (next: TeamLayout) => {
      if (next === layout) return
      window.localStorage.setItem(STORAGE_KEY, next)
      setLayoutState(next)
      window.clearTimeout(trackTimeoutRef.current)
      trackTimeoutRef.current = window.setTimeout(() => {
        SendClientSideEvent(atmosphere, 'Standup Layout Changed', {layout: next, meetingId, teamId})
      }, TRACK_DELAY_MS)
    },
    [atmosphere, meetingId, teamId, layout]
  )
  return [layout, setLayout] as const
}

export type PhoneTeamLayout = 'person' | 'question'

export const toPhoneLayout = (layout: TeamLayout): PhoneTeamLayout =>
  layout === 'byQuestion' ? 'question' : 'person'

const fromPhoneLayout = (layout: PhoneTeamLayout): TeamLayout =>
  layout === 'question' ? 'byQuestion' : 'feed'

export const nextLayoutForPhoneChoice = (
  layout: TeamLayout,
  choice: PhoneTeamLayout
): TeamLayout | null => (choice === toPhoneLayout(layout) ? null : fromPhoneLayout(choice))

export default useTeamLayoutPreference
