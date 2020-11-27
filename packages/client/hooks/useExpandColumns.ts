import {RefObject, useLayoutEffect, useState} from 'react'
import {Breakpoint} from '~/types/constEnums'
import useBreakpoint from './useBreakpoint'
import useResizeObserver from './useResizeObserver'

const useExpandColumns = (phaseRef: RefObject<HTMLDivElement>, reflectPromptsCount: number) => {
  const [isExpanded, setIsExpanded] = useState(false)
  console.log("🚀 ~ useExpandColumns ~ isExpanded", isExpanded)
  const isWiderScreen = useBreakpoint(Breakpoint.WIDER_SCREEN)
  const phaseBBox = phaseRef.current?.getBoundingClientRect()
  const width = phaseBBox?.width 
  useLayoutEffect(() => {
    console.log("🚀 ~ useExpandColumns ~ width", width, reflectPromptsCount)

    if (width && reflectPromptsCount * 300 * 2 < width){
      setIsExpanded(true)
    } else {
      setIsExpanded(false)
    }
  }, [width])
  // useLayoutEffect(adjustLeft, [estimateAreaRef])
  // useResizeObserver(adjustLeft, estimateAreaRef)
  return isExpanded
}

export default useExpandColumns
