import useBreakpoint from 'universal/hooks/useBreakpoint'
import React, {ReactNode} from 'react'
import SwipeableDashSidebar from 'universal/components/SwipeableDashSidebar'
import StaticSidebar from 'universal/components/StaticSidebar'
import {DASH_SIDEBAR} from 'universal/components/Dashboard/DashSidebar'
import {desktopSidebarShadow} from 'universal/styles/elevation'
import styled from 'react-emotion'

interface Props {
  children: ReactNode
  isOpen: boolean
  onToggle: () => void
}

const Sidebar = styled('div')({
  boxShadow: desktopSidebarShadow
})

const ResponsiveDashSidebar = (props: Props) => {
  const {children, isOpen, onToggle} = props
  const isDesktop = useBreakpoint(DASH_SIDEBAR.BREAKPOINT)
  if (isDesktop) {
    return (
      <StaticSidebar isOpen={isOpen}>
        <Sidebar>{children}</Sidebar>
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
