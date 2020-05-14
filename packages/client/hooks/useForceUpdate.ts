import {useCallback, useEffect, useReducer, useRef} from 'react'

const useForceUpdate = () => {
  const isMountedRef = useRef(true)
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])
  const forceUpdate = useReducer((x) => x + 1, 0)[1] as () => void
  return useCallback(() => {
    if (isMountedRef.current) {
      forceUpdate()
    }
  }, [])
}

export default useForceUpdate
