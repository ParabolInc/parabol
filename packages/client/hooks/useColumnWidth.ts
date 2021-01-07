import {RefObject, useLayoutEffect, useState} from 'react'
import {Breakpoint} from '~/types/constEnums'
import useBreakpoint from './useBreakpoint'

const DEFAULT_MAX_SUB_COLUMNS = 2

const useColumnWidth = (
  reflectPromptsCount: number,
  columnRef: RefObject<HTMLDivElement>
): [boolean, number, () => void] => {
  const [isWidthExpanded, setIsWidthExpanded] = useState(false)
  const [maxSubColumnCount, setMaxSubColumnCount] = useState(DEFAULT_MAX_SUB_COLUMNS)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const isWiderScreen = useBreakpoint(Breakpoint.WIDER_SCREEN)

  const toggleWidth = () => {
    setIsWidthExpanded(!isWidthExpanded)
  }
  useLayoutEffect(() => {
    if (!isDesktop && isWidthExpanded) {
      setIsWidthExpanded(false)
      return
    }
    const expandWidth =
      (reflectPromptsCount === 1 && isDesktop) || (reflectPromptsCount === 2 && isWiderScreen)
    if (isWidthExpanded !== expandWidth) {
      toggleWidth()
    }
    const el = columnRef.current
    if (el) {
      const newMaxSubColumnCount = Math.ceil(el.scrollHeight / el.clientHeight)
      if (newMaxSubColumnCount > maxSubColumnCount) {
        setMaxSubColumnCount(newMaxSubColumnCount)
      }
    }
  }, [isDesktop, isWiderScreen])

  return [isWidthExpanded, maxSubColumnCount, toggleWidth]
}

export default useColumnWidth
