import {type RefObject, useLayoutEffect, useState} from 'react'

// Measured before the first paint, so a layout that depends on it doesn't shift after it shows
export const useHasMinWidth = (ref: RefObject<HTMLElement>, minWidth: number) => {
  const [hasMinWidth, setHasMinWidth] = useState(false)
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => setHasMinWidth(element.clientWidth >= minWidth)
    measure()
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(element)
    return () => {
      resizeObserver.disconnect()
    }
  }, [ref, minWidth])
  return hasMinWidth
}
