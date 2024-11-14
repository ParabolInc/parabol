import styled from '@emotion/styled'
import {ReactNode} from 'react'
import useBreakpoint from '../hooks/useBreakpoint'
import {DECELERATE} from '../styles/animation'
import {desktopSidebarShadow, Elevation} from '../styles/elevation'
import {Breakpoint} from '../types/constEnums'
import StaticSidebar from './StaticSidebar'
import SwipeableDashSidebar from './SwipeableDashSidebar'

interface Props {
  children: ReactNode
  isOpen: boolean
  onToggle: () => void
  isRightDrawer?: boolean
  sidebarWidth?: number
  isDesktop?: boolean
}

const Sidebar = styled('div')<{isOpen: boolean}>(({isOpen}) => ({
  boxShadow: isOpen ? desktopSidebarShadow : Elevation.Z0,
  transition: `box-shadow 200ms ${DECELERATE}`
}))

const ResponsiveDashSidebar = (props: Props) => {
  const {children, isOpen, onToggle, isRightDrawer = false, sidebarWidth, isDesktop} = props
  const isDesktopDefault = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const showDesktopView = isDesktop ?? isDesktopDefault
  if (showDesktopView) {
    return (
      <StaticSidebar isOpen={isOpen} isRightDrawer={isRightDrawer}>
        <Sidebar isOpen={isOpen}>{children}</Sidebar>
      </StaticSidebar>
    )
  }
  return (
    <SwipeableDashSidebar
      isOpen={isOpen}
      isRightDrawer={isRightDrawer}
      onToggle={onToggle}
      sidebarWidth={sidebarWidth}
    >
      {children}
    </SwipeableDashSidebar>
  )
}

export default ResponsiveDashSidebar
