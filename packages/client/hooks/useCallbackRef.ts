import {MutableRefObject, useCallback, useRef} from 'react'
import useForceUpdate from './useForceUpdate'

const useCallbackRef = (): [(node) => void, MutableRefObject<HTMLDivElement | null>] => {
  const ref = useRef<HTMLDivElement | null>(null)
  const forceUpdate = useForceUpdate()
  const callbackRef = useCallback((node) => {
    if (node !== null) {
      ref.current = node
      forceUpdate()
    }
  }, [])

  return [callbackRef, ref]
}

export default useCallbackRef
