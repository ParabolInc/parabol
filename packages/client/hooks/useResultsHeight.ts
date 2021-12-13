import {RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'

// if results are remotely ungrouped, SpotlightResults increases in height.
// to prevent the modal height from changing, use initial groups height
const useResultsHeight = (resultsRef: RefObject<HTMLDivElement>) => {
  const [height, setHeight] = useState<number | string>('100%')

  useLayoutEffect(() => {
    const newHeight = resultsRef.current?.clientHeight
    if (newHeight && height !== newHeight) {
      setHeight(newHeight)
    }
  }, [height])

  useResizeObserver(() => {
    // when resized & has ref, set height to 100% so that useLayoutEffect can calc the new height
    if (resultsRef.current) {
      setHeight('100%')
    }
  }, resultsRef)
  return height
}

export default useResultsHeight
