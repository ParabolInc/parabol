import {RefObject, useEffect} from 'react'
import useEventCallback from './useEventCallback'

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
    // in the future we'll probably change this to mousedown
    // but for now, the reply needs to trigger later
    // REPRO: given 2 comments, click reply on 1st, then reply on 2nd
    // make sure the 2nd reply input opens on click
    document.addEventListener('click', handler)
    // document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('click', handler)
      // document.removeEventListener('touchstart', handler)
    }
  }, [ref])
}

export default useClickAway
