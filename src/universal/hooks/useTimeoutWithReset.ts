import {useCallback, useEffect, useRef, useState} from 'react'

const useTimeoutWithReset = (duration: number, resetDuration: number = duration) => {
  const [timedOut, setTimedOut] = useState(false)
  let resetTimerRef = useRef<number | undefined>()
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTimedOut(true)
    }, duration)
    return () => {
      clearTimeout(timer)
      clearTimeout(resetTimerRef.current)
    }
  }, [])

  const reset = useCallback(() => {
    setTimedOut(false)
    resetTimerRef.current = window.setTimeout(() => {
      setTimedOut(true)
    }, resetDuration)
  }, [])

  return [timedOut, reset] as [boolean, () => void]
}

export default useTimeoutWithReset
