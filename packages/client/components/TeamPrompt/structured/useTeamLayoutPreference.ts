import {useCallback, useState} from 'react'
import setStorageItem from '../../../utils/setStorageItem'

export type TeamLayout = 'grid' | 'feed' | 'byQuestion'
const STORAGE_KEY = 'standup:teamLayout'
const LAYOUTS: TeamLayout[] = ['grid', 'feed', 'byQuestion']

const readLayout = (): TeamLayout => {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return LAYOUTS.includes(stored as TeamLayout) ? (stored as TeamLayout) : 'grid'
}

const useTeamLayoutPreference = () => {
  const [layout, setLayoutState] = useState<TeamLayout>(readLayout)
  const setLayout = useCallback(
    (next: TeamLayout) => {
      if (next === layout) return
      setStorageItem('localStorage', STORAGE_KEY, next)
      setLayoutState(next)
    },
    [layout]
  )
  return [layout, setLayout] as const
}

export default useTeamLayoutPreference
