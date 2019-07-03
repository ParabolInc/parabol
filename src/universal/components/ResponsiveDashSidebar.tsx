import useBreakpoint from 'universal/hooks/useBreakpoint'
import React, {ReactNode} from 'react'
import SwipeableDashSidebar from 'universal/components/SwipeableDashSidebar'
import styled from 'react-emotion'
import {ZIndex} from 'universal/types/constEnums'

interface Props {
  children: ReactNode
}

const Fixed = styled('div')({
  position: 'fixed',
  // TODO need to fix this so we don't need + 1
  zIndex: ZIndex.SIDEBAR + 1
})
const ResponsiveDashSidebar = (props: Props) => {
  const {children} = props
  const isLarge = useBreakpoint(800)
  if (isLarge) {
    return <Fixed>{children}</Fixed>
  }
  return <SwipeableDashSidebar>{children}</SwipeableDashSidebar>
}

export default ResponsiveDashSidebar
