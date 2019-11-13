import {useEffect} from 'react'
import useToggleSidebar from './useToggleSidebar'

const useMobileSidebarDefaultClosed = (
  isDesktop: boolean,
  toggleSidebar: ReturnType<typeof useToggleSidebar>
) => {
  useEffect(() => {
    if (isDesktop) {
      toggleSidebar()
    }
  }, [isDesktop, toggleSidebar])
}

export default useMobileSidebarDefaultClosed
