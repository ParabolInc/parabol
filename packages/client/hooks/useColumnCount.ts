import {type RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'

/**
 * Calculates how many columns fit in a container, matching the CSS grid behavior of
 * `grid-cols-[repeat(auto-fill,minmax(min(minColFraction, minColWidth),1fr))]`.
 *
 * The `minColFraction` parameter mirrors the `min(40%, 256px)` CSS pattern where
 * on narrow screens the percentage kicks in, allowing more columns than a fixed
 * pixel minimum would.
 */
const useColumnCount = (
  containerRef: RefObject<HTMLElement>,
  minColWidth: number,
  gap: number,
  minColFraction = 0.4
) => {
  const [columnCount, setColumnCount] = useState(1)

  const updateColumnCount = () => {
    const el = containerRef.current
    if (!el) return
    const width = el.clientWidth
    const effectiveMinWidth = Math.min(width * minColFraction, minColWidth)
    setColumnCount(Math.max(1, Math.floor((width + gap) / (effectiveMinWidth + gap))))
  }

  useLayoutEffect(updateColumnCount, [containerRef])
  useResizeObserver(updateColumnCount, containerRef)
  return columnCount
}

export default useColumnCount
