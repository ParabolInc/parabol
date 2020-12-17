import {useMemo} from 'react'
import {Breakpoint, DiscussionThreadEnum, ElementWidth, NavSidebar} from '~/types/constEnums'
import useBreakpoint from './useBreakpoint'
import useInnerWidth from './useInnerWidth'

const useControlBarLeft = (
  showSidebar: boolean,
  showRightDrawer: boolean,
  buttonsCount: number
): number => {
  const innerWidth = useInnerWidth()
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  return useMemo(() => {
    if (!isDesktop) return 0
    const controlBarWidth =
      buttonsCount * ElementWidth.CONTROL_BAR_BUTTON + ElementWidth.CONTROL_BAR_PADDING * 2
    const sidebarWidth = showSidebar ? NavSidebar.WIDTH : 0
    const rightDrawerWidth = showRightDrawer ? DiscussionThreadEnum.WIDTH : 0
    const meetingAreaCenter = (innerWidth - sidebarWidth - rightDrawerWidth) / 2
    return sidebarWidth + meetingAreaCenter - controlBarWidth / 2
  }, [showSidebar, showRightDrawer, buttonsCount, innerWidth])
}

export default useControlBarLeft
