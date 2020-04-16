import {useRef, useCallback, useState} from 'react'

const useHover = <T extends HTMLElement>(): [(node?: T | null) => void, boolean] => {
  const [hover, setHover] = useState(false)
  const handleMouseEnter = useCallback(() => setHover(true), [])
  const handleMouseLeave = useCallback(() => setHover(false), [])
  const ref = useRef<T>()

  const callbackRef = useCallback<(node?: null | T) => void>(
    (node) => {
      if (ref.current) {
        ref.current.removeEventListener('mouseenter', handleMouseEnter)
        ref.current.removeEventListener('mouseleave', handleMouseLeave)
      }

      ref.current = node || undefined

      if (ref.current) {
        ref.current.addEventListener('mouseenter', handleMouseEnter)
        ref.current.addEventListener('mouseleave', handleMouseLeave)
      }
    },
    [handleMouseEnter, handleMouseLeave]
  )

  return [callbackRef, hover]
}

export default useHover
