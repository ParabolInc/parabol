import {useCallback, useEffect, useRef} from 'react'

// https://github.com/react-restart/hooks/blob/master/src/useEventCallback.ts
// https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback

const useEventCallback = <T extends (...args: any[]) => any>(fn: T) => {
  const ref = useRef<T>(fn)

  useEffect(() => {
    ref.current = fn
  }, [fn])

  return useCallback((...args: any[]) => {
    return ref.current(...args)
  }, []) as T
}

export default useEventCallback
