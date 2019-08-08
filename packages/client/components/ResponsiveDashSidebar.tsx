import useBreakpoint from '../hooks/useBreakpoint'
import React, {ReactNode} from 'react'
import SwipeableDashSidebar from './SwipeableDashSidebar'
import StaticSidebar from './StaticSidebar'
import {desktopSidebarShadow, Elevation} from '../styles/elevation'
import styled from '@emotion/styled'
import {DECELERATE} from '../styles/animation'
import {Breakpoint} from '../types/constEnums'

interface Props {
  children: ReactNode
  isOpen: boolean
  onToggle: () => void
}

const Sidebar = styled('div')<{isOpen: boolean}>(({isOpen}) => ({
  boxShadow: isOpen ? desktopSidebarShadow : Elevation.Z0,
  transition: `box-shadow 200ms ${DECELERATE}`
}))

const ResponsiveDashSidebar = (props: Props) => {
  const {children, isOpen, onToggle} = props
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  if (isDesktop) {
    return (
      <StaticSidebar isOpen={isOpen}>
        <Sidebar isOpen={isOpen}>{children}</Sidebar>
      </StaticSidebar>
    )
  }
  return (
    <SwipeableDashSidebar isOpen={isOpen} onToggle={onToggle}>
      {children}
    </SwipeableDashSidebar>
  )
}

export default ResponsiveDashSidebar
