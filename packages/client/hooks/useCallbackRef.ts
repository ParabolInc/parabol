import {useCallback, useRef} from 'react'
import useForceUpdate from './useForceUpdate'

const useCallbackRef = () => {
  const ref = useRef<HTMLDivElement | null>(null)
  const forceUpdate = useForceUpdate()
  const callbackRef = useCallback((node) => {
    if (node !== null) {
      ref.current = node
      forceUpdate()
    }
  }, [])

  return [callbackRef, ref] as const
}

export default useCallbackRef
