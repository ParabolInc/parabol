import {useEffect, useRef, useState} from 'react'

// Passes a change through at once, then holds later ones until intervalMs has passed and shows the latest
const useThrottledValue = <T>(value: T, intervalMs: number) => {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastSetAtRef = useRef(0)
  useEffect(() => {
    if (Object.is(value, throttledValue)) return
    const show = () => {
      lastSetAtRef.current = Date.now()
      setThrottledValue(value)
    }
    const delay = lastSetAtRef.current + intervalMs - Date.now()
    if (delay <= 0) {
      show()
      return
    }
    const timer = setTimeout(show, delay)
    return () => clearTimeout(timer)
  }, [value, throttledValue, intervalMs])
  return throttledValue
}

export default useThrottledValue
