import {useCallback, useEffect, useRef, useState} from 'react'

const useTimeoutWithReset = (duration: number, resetDuration: number = duration) => {
  const [timedOut, setTimedOut] = useState(false)
  const resetTimerRef = useRef<number | undefined>()
  let isMounted = true
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTimedOut(true)
    }, duration)
    return () => {
      isMounted = false
      clearTimeout(timer)
      clearTimeout(resetTimerRef.current)
    }
  }, [])

  const reset = useCallback(() => {
    setTimedOut(false)
    resetTimerRef.current = window.setTimeout(() => {
      if (isMounted) {
        setTimedOut(true)
      }
    }, resetDuration)
  }, [])

  return [timedOut, reset] as [boolean, () => void]
}

export default useTimeoutWithReset
