import useEventCallback from './useEventCallback'
import {RefObject, useEffect} from 'react'

const useClickAway = (
  ref: RefObject<HTMLElement> | null,
  callback: (event: MouseEvent | TouchEvent) => void
) => {
  const cb = useEventCallback(callback)
  useEffect(() => {
    if (!ref) return
    const handler = (e: MouseEvent | TouchEvent) => {
      const el = ref.current
      if (el && !el.contains(e.target as Node)) {
        cb(e)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [ref])
}

export default useClickAway
