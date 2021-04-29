import {RefObject, useEffect} from 'react'
import useForceUpdate from './useForceUpdate'

const useResizeFontForElement = <T extends HTMLElement = HTMLInputElement>(
  ref: RefObject<T>,
  value: string | number,
  minSize: number,
  maxSize: number,
  reduceBy = 0
) => {
  const forceUpdate = useForceUpdate()
  useEffect(() => {
    const el = ref.current
    if (!el) {
      forceUpdate()
      return
    }
    const {style} = el
    let reduced = 0
    for (let i = maxSize; i >= minSize; i--) {
      style.fontSize = `${i}px`
      const {clientWidth, scrollWidth} = el
      if (scrollWidth <= clientWidth) {
        if (reduced === reduceBy) return
        reduced++
      }
    }
  }, [value, ref.current])
}
export default useResizeFontForElement
