import {RefObject, useLayoutEffect, useState} from 'react'
import {Breakpoint} from '~/types/constEnums'
import useBreakpoint from './useBreakpoint'

const DEFAULT_MAX_SUB_COLUMNS = 2

const useColumnWidth = (
  reflectPromptsCount: number,
  columnRef: RefObject<HTMLDivElement>,
  columnHeaderRef: RefObject<HTMLDivElement>
): [boolean, number, () => void] => {
  const [isWidthExpanded, setIsWidthExpanded] = useState(false)
  const [maxSubColumnCount, setMaxSubColumnCount] = useState(DEFAULT_MAX_SUB_COLUMNS)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const isWiderScreen = useBreakpoint(Breakpoint.WIDER_SCREEN)

  const toggleWidth = () => {
    setIsWidthExpanded(!isWidthExpanded)
    const columnEl = columnRef.current
    const columnHeaderEl = columnHeaderRef.current
    if (columnEl && columnHeaderEl) {
      const headerHeight = columnHeaderEl.clientHeight
      const newMaxSubColumnCount = Math.ceil(
        columnEl.scrollHeight / (columnEl.clientHeight - headerHeight)
      )
      setMaxSubColumnCount(newMaxSubColumnCount)
    }
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
  }, [isDesktop, isWiderScreen])

  return [isWidthExpanded, maxSubColumnCount, toggleWidth]
}

export default useColumnWidth
