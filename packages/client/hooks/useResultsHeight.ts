import {RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'

// if results are remotely ungrouped, SpotlightGroups increases in height.
// to prevent the modal height from changing, use initial groups height
const useResultsHeight = (resultsRef: RefObject<HTMLDivElement>, spotlightSearchQuery: string) => {
  const [height, setHeight] = useState<number | string>('100%')

  useLayoutEffect(() => {
    const newHeight = resultsRef.current?.clientHeight
    if (newHeight && height !== newHeight && !spotlightSearchQuery) {
      console.log(`Setting the height from ${height} to ${newHeight}`)
      setHeight(newHeight)
    }
  }, [height])

  useResizeObserver(() => {
    // when resized, set height to 100% so that useLayoutEffect can calc the new height
    setHeight('100%')
  }, resultsRef)
  return height
}

export default useResultsHeight
