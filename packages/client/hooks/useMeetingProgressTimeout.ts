import {useEffect, useRef, useState} from 'react'
import useEventCallback from './useEventCallback'

const useMeetingProgressTimeout = (
  minTime: number,
  localScheduledEndTime: string | undefined | null,
  resetDuration?: number
) => {
  const [timedOut, setTimedOut] = useState(false)
  const timerRef = useRef<number | undefined>()
  useEffect(() => {
    setTimedOut(false)
    const nextTimeLeft = localScheduledEndTime
      ? new Date(localScheduledEndTime).getTime() - Date.now()
      : minTime
    timerRef.current = window.setTimeout(() => {
      setTimedOut(true)
    }, nextTimeLeft)
    return () => {
      window.clearTimeout(timerRef.current)
    }
  }, [localScheduledEndTime])

  const reset = useEventCallback(() => {
    // if they're using or have used a timer, manual resets
    if (localScheduledEndTime) return
    setTimedOut(false)
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      setTimedOut(true)
    }, resetDuration)
  })

  return [timedOut, reset] as [boolean, () => void]
}

export default useMeetingProgressTimeout
