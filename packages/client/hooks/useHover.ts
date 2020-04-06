import {useRef, useCallback, useState} from 'react'

const useHover = <T extends HTMLElement>(): [(node?: T | null) => void, boolean] => {
  const [hover, setHover] = useState(false)
  const handleMouseOver = useCallback(() => setHover(true), [])
  const handleMouseOut = useCallback(() => setHover(false), [])
  const ref = useRef<T>()

  const callbackRef = useCallback<(node?: null | T) => void>(
    (node) => {
      if (ref.current) {
        ref.current.removeEventListener('mouseover', handleMouseOver)
        ref.current.removeEventListener('mouseout', handleMouseOut)
      }

      ref.current = node || undefined

      if (ref.current) {
        ref.current.addEventListener('mouseover', handleMouseOver)
        ref.current.addEventListener('mouseout', handleMouseOut)
      }
    },
    [handleMouseOver, handleMouseOut]
  )

  return [callbackRef, hover]
}

export default useHover
