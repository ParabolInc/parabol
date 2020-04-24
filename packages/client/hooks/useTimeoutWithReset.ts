import {useEffect, useRef, useState} from 'react'
import useEventCallback from './useEventCallback'

const useTimeoutWithReset = (duration: number, resetDuration: number = duration) => {
  const [timedOut, setTimedOut] = useState(false)
  const resetTimerRef = useRef<number | undefined>()
  const isMountedRef = useRef(true)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTimedOut(true)
    }, duration)
    return () => {
      isMountedRef.current = false
      clearTimeout(timer)
      clearTimeout(resetTimerRef.current)
    }
  }, [duration])

  const reset = useEventCallback(() => {
    setTimedOut(false)
    resetTimerRef.current = window.setTimeout(() => {
      if (isMountedRef.current) {
        setTimedOut(true)
      }
    }, resetDuration)
  })

  return [timedOut, reset] as [boolean, () => void]
}

export default useTimeoutWithReset
