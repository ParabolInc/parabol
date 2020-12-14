import {useLayoutEffect, useState} from 'react'
import {Breakpoint} from '~/types/constEnums'
import useBreakpoint from './useBreakpoint'

const useColumnWidth = (reflectPromptsCount: number): [boolean, () => void] => {
  const [isWidthExpanded, setIsWidthExpanded] = useState(false)
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
  }, [isDesktop, isWiderScreen])

  return [isWidthExpanded, toggleWidth]
}

export default useColumnWidth
