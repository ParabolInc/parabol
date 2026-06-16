import styled from '@emotion/styled'
import {type CSSProperties, type ReactNode, useRef} from 'react'
import {useCoverable} from '../hooks/useControlBarCovers'
import {DECELERATE} from '../styles/animation'
import {desktopSidebarShadow} from '../styles/elevation'
import {MeetingControlBarEnum, NavSidebar, ZIndex} from '../types/constEnums'

const DURATION = 200

interface StyleProps {
  isOpen: boolean
  isRightDrawer?: boolean
}

const Placeholder = styled('div')<StyleProps>(({isOpen}) => ({
  minWidth: isOpen ? NavSidebar.WIDTH : 0,
  maxWidth: isOpen ? NavSidebar.WIDTH : 0,
  // changing width is expensive, but this is only run on non-mobile devices, so it's not horrible & looks better than alternatives
  transition: `all ${DURATION}ms ${DECELERATE}`,
  // needs to be above the main view area
  zIndex: ZIndex.SIDE_SHEET
}))

const Fixed = styled('div')<StyleProps>(({isOpen}) => ({
  position: 'fixed',
  transform: `translateX(${isOpen ? 0 : -NavSidebar.WIDTH}px)`,
  transition: `all ${DURATION}ms ${DECELERATE}`
}))

// Inline style keeps `transition` stable across renders so only `width` changes,
// giving the browser a clear before/after for the CSS transition to fire.
// height is intentionally omitted so useCoverable can override it via style.height
const RIGHT_DRAWER_STYLE: CSSProperties = {
  overflow: 'hidden',
  flexShrink: 0,
  flexGrow: 0,
  minWidth: 0,
  transition: `width ${DURATION}ms ${DECELERATE}, box-shadow ${DURATION}ms ${DECELERATE}`
}

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
        className='h-full'
        style={{
          ...RIGHT_DRAWER_STYLE,
          width: isOpen ? sidebarWidth : 0,
          boxShadow: isOpen ? desktopSidebarShadow : 'none'
        }}
      >
        {children}
      </div>
    )
  }
  return (
    <Placeholder isOpen={isOpen}>
      <Fixed isOpen={isOpen}>{children}</Fixed>
    </Placeholder>
  )
}

export default StaticSidebar
