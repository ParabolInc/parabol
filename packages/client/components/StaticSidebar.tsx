import {type ReactNode, useRef} from 'react'
import {useCoverable} from '../hooks/useControlBarCovers'
import {desktopSidebarShadow} from '../styles/elevation'
import {MeetingControlBarEnum, NavSidebar} from '../types/constEnums'
import {cn} from '../ui/cn'

interface Props {
  children: ReactNode
  isOpen: boolean
  isRightDrawer?: boolean
  sidebarWidth?: number
}

const StaticSidebar = (props: Props) => {
  const {children, isOpen, isRightDrawer = false, sidebarWidth = NavSidebar.WIDTH} = props
  const rightDrawerRef = useRef<HTMLDivElement>(null)
  // Register the right-drawer container as a coverable so it (and its box shadow) shrink
  // when the MeetingControlBar is dragged over it. Empty id is a no-op for non-right-drawer.
  // Pass rightDrawerRef as parentRef so the ResizeObserver re-runs updateCoverables whenever
  // the drawer opens/closes (width animates from 0→360). Without this, bounds are computed
  // once on mount when the drawer is typically closed (width=0) and never updated.
  useCoverable(
    isRightDrawer ? 'drawer' : '',
    rightDrawerRef,
    MeetingControlBarEnum.COVER_HEIGHT,
    rightDrawerRef,
    undefined,
    undefined,
    0 // no buffer: shrink exactly when the bar's right edge reaches the drawer's left edge
  )

  if (isRightDrawer) {
    return (
      <div
        ref={rightDrawerRef}
        className='z-side-sheet h-full min-w-0 shrink-0 grow-0 overflow-hidden transition-[width,box-shadow] duration-200 ease-[cubic-bezier(0,0,.2,1)]'
        style={{
          // height is intentionally omitted so useCoverable can override it via style.height
          width: isOpen ? sidebarWidth : 0,
          boxShadow: isOpen ? desktopSidebarShadow : 'none'
        }}
      >
        {children}
      </div>
    )
  }
  return (
    <div
      className={cn(
        // changing width is expensive, but this is only run on non-mobile devices, so it's not horrible & looks better than alternatives
        // needs to be above the main view area
        'z-side-sheet transition-all duration-200 ease-[cubic-bezier(0,0,.2,1)]',
        isOpen ? 'min-w-64 max-w-64' : 'min-w-0 max-w-0'
      )}
    >
      <div
        className={cn(
          'fixed transition-all duration-200 ease-[cubic-bezier(0,0,.2,1)]',
          isOpen ? 'translate-x-0' : '-translate-x-64'
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default StaticSidebar
