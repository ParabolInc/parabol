import styled from '@emotion/styled'
import type {CSSProperties, ReactNode} from 'react'
import {DECELERATE} from '../styles/animation'
import {desktopSidebarShadow} from '../styles/elevation'
import {NavSidebar, ZIndex} from '../types/constEnums'

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
const RIGHT_DRAWER_STYLE: CSSProperties = {
  overflow: 'hidden',
  flexShrink: 0,
  flexGrow: 0,
  minWidth: 0,
  height: '100%',
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
  if (isRightDrawer) {
    return (
      <div
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
