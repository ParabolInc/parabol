import styled from 'react-emotion'
import {DASH_SIDEBAR} from 'universal/components/Dashboard/DashSidebar'
import React, {ReactNode} from 'react'
import {DECELERATE} from 'universal/styles/animation'

const DURATION = 200
const Placeholder = styled('div')(({isOpen}: {isOpen: boolean}) => ({
  minWidth: isOpen ? DASH_SIDEBAR.WIDTH : 0,
  maxWidth: isOpen ? DASH_SIDEBAR.WIDTH : 0,
  // changing width is expensive, but this is only run on non-mobile devices, so it's not horrible & looks better than alternatives
  transition: `all ${DURATION}ms ${DECELERATE}`,
  // needs to be above the main view area
  zIndex: 200
}))

const Fixed = styled('div')(({isOpen}: {isOpen: boolean}) => ({
  position: 'fixed',
  transform: `translateX(${isOpen ? 0 : -DASH_SIDEBAR.WIDTH}px)`,
  transition: `all ${DURATION}ms ${DECELERATE}`
}))

interface Props {
  children: ReactNode
  isOpen: boolean
}

const StaticSidebar = (props: Props) => {
  const {children, isOpen} = props
  return (
    <Placeholder isOpen={isOpen}>
      <Fixed isOpen={isOpen}>{children}</Fixed>
    </Placeholder>
  )
}

export default StaticSidebar
