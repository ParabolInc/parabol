import useBreakpoint from 'universal/hooks/useBreakpoint'
import React, {ReactNode} from 'react'
import SwipeableDashSidebar from 'universal/components/SwipeableDashSidebar'
import StaticSidebar from 'universal/components/StaticSidebar'
import {DASH_SIDEBAR} from 'universal/components/Dashboard/DashSidebar'
import elevation, {desktopSidebarShadow} from 'universal/styles/elevation'
import styled from '@emotion/styled'
import {DECELERATE} from 'universal/styles/animation'

interface Props {
  children: ReactNode
  isOpen: boolean
  onToggle: () => void
}

const Sidebar = styled('div')<{isOpen: boolean}>(({isOpen}) => ({
  boxShadow: isOpen ? desktopSidebarShadow : elevation[0],
  transition: `box-shadow 200ms ${DECELERATE}`
}))

const ResponsiveDashSidebar = (props: Props) => {
  const {children, isOpen, onToggle} = props
  const isDesktop = useBreakpoint(DASH_SIDEBAR.BREAKPOINT)
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
