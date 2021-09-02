import {useEffect} from 'react'
import useEventCallback from './useEventCallback'

export const useBeforeUnload = (callback: () => any) => {
  const cb = useEventCallback(callback)

  useEffect(() => {
    window.addEventListener('beforeunload', cb)
    return () => {
      window.removeEventListener('beforeunload', cb)
    }
  }, [cb])
}
