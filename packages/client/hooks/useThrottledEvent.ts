import {useRef} from 'react'
import useEventCallback from './useEventCallback'

const useThrottledEvent = <T extends (...args: any[]) => any>(fn: T, limit: number) => {
  const isThrottledRef = useRef(false)
  const callback = useEventCallback(fn)
  return (...args: any[]) => {
    if (!isThrottledRef.current) {
      isThrottledRef.current = true
      callback(...args)
      setTimeout(() => {
        isThrottledRef.current = false
      }, limit)
    }
  }
}

export default useThrottledEvent
