import {useMemo} from 'react'
import {DiscussionThreadEnum, ElementWidth, NavSidebar} from '~/types/constEnums'

const useControlBarLeft = (
  showRightDrawer: boolean,
  showSidebar: boolean,
  buttonsCount: number
): number => {
  return useMemo(() => {
    const windowWidth = window.innerWidth
    const controlBarWidth =
      buttonsCount * ElementWidth.CONTROL_BAR_BUTTON + ElementWidth.CONTROL_BAR_PADDING * 2
    const sidebarWidth = showSidebar ? NavSidebar.WIDTH : 0
    const rightDrawerWidth = showRightDrawer ? DiscussionThreadEnum.WIDTH : 0
    const meetingAreaCenter = (windowWidth - sidebarWidth - rightDrawerWidth) / 2
    return sidebarWidth + meetingAreaCenter - controlBarWidth / 2
  }, [showSidebar, showRightDrawer, buttonsCount])
}

export default useControlBarLeft
