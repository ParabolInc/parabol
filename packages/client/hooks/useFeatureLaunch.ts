import {useCallback, useEffect, useState, useSyncExternalStore} from 'react'
import {
  type FeatureLaunchId,
  isFeatureLaunchLive,
  markFeatureLaunchSeen,
  subscribeToFeatureLaunches
} from '../utils/featureLaunches'

// retiring gives the highlight time to fade out instead of vanishing under the viewer's click
export type FeatureLaunchStatus = 'new' | 'retiring' | 'off'

const RETIRE_MS = 800

const useFeatureLaunch = (id: FeatureLaunchId, isEligible = true) => {
  const isLive = useSyncExternalStore(
    subscribeToFeatureLaunches,
    () => isEligible && isFeatureLaunchLive(id, new Date())
  )
  const [wasLive, setWasLive] = useState(isLive)
  const [isRetiring, setIsRetiring] = useState(false)
  if (isLive !== wasLive) {
    setWasLive(isLive)
    setIsRetiring(!isLive)
  }
  useEffect(() => {
    if (!isRetiring) return
    const timer = setTimeout(() => setIsRetiring(false), RETIRE_MS)
    return () => clearTimeout(timer)
  }, [isRetiring])
  const dismiss = useCallback(() => markFeatureLaunchSeen(id), [id])
  const status: FeatureLaunchStatus = isLive ? 'new' : isRetiring ? 'retiring' : 'off'
  return [status, dismiss] as const
}

export default useFeatureLaunch
