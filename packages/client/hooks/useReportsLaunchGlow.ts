import {useMatchRoute} from '@tanstack/react-router'
import {useEffect, useState} from 'react'
import {
  isReportsLaunchGlowActive,
  markReportsLaunchSeen,
  readReportsLaunchSeen
} from '../components/Dashboard/reportsLaunchSeen'

export type ReportsLaunchGlowState = 'glowing' | 'retiring' | 'off'

const RETIRE_MS = 800
const SUNSET_CHECK_MS = 60 * 60 * 1000

const useReportsLaunchGlow = (lastMetAt: string | null) => {
  const matchRoute = useMatchRoute()
  const onReports = !!matchRoute({to: '/reports', fuzzy: true})
  const [state, setState] = useState<ReportsLaunchGlowState>(() =>
    !onReports && isReportsLaunchGlowActive(new Date(), readReportsLaunchSeen(), lastMetAt)
      ? 'glowing'
      : 'off'
  )

  useEffect(() => {
    if (!onReports) return
    markReportsLaunchSeen()
    setState((prev) => (prev === 'glowing' ? 'retiring' : prev))
  }, [onReports])

  useEffect(() => {
    if (state === 'retiring') {
      const timer = setTimeout(() => setState('off'), RETIRE_MS)
      return () => clearTimeout(timer)
    }
    if (state === 'glowing') {
      const timer = setInterval(() => {
        if (!isReportsLaunchGlowActive(new Date(), false, lastMetAt)) setState('off')
      }, SUNSET_CHECK_MS)
      return () => clearInterval(timer)
    }
    return undefined
  }, [state, lastMetAt])

  return state
}

export default useReportsLaunchGlow
