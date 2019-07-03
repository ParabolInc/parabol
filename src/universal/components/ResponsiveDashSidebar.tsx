import useBreakpoint from 'universal/hooks/useBreakpoint'
import React, {ReactNode} from 'react'
import SwipeableDashSidebar from 'universal/components/SwipeableDashSidebar'
import StaticSidebar from 'universal/components/StaticSidebar'

interface Props {
  children: ReactNode
}

const ResponsiveDashSidebar = (props: Props) => {
  const {children} = props
  const isLarge = useBreakpoint(800)
  const Sidebar = isLarge ? StaticSidebar : SwipeableDashSidebar
  return <Sidebar>{children}</Sidebar>
}

export default ResponsiveDashSidebar
