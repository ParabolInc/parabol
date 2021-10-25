import {RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'

// if results are remotely ungrouped, SpotlightGroups increases in height.
// to prevent the modal height from changing, use initial groups height
const useResultsHeight = (resultsRef: RefObject<HTMLDivElement>) => {
  const [height, setHeight] = useState<number | string>('100%')

  const getHeight = () => {
    const {current: el} = resultsRef
    const height = el?.clientHeight
    if (!height) return
    return height
  }

  useLayoutEffect(() => {
    const newHeight = getHeight()
    if (newHeight && height !== newHeight) {
      setHeight(newHeight)
    }
  }, [resultsRef.current, height])

  useResizeObserver(() => {
    // when resized, set height to 100% so that useLayoutEffect can calc the new height
    setHeight('100%')
  }, resultsRef)
  return height
}

export default useResultsHeight
