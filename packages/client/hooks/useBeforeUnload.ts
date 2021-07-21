import {useRef, useEffect} from 'react'

export const useBeforeUnload = (callback: () => any) => {
  const callbackRef = useRef(callback)

  useEffect(() => {
    const onUnload = callbackRef.current
    window.addEventListener('beforeunload', onUnload)
    return () => {
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [callbackRef])
}
