import styled from 'react-emotion'
import {DASH_SIDEBAR} from 'universal/components/Dashboard/DashSidebar'
import React, {ReactNode} from 'react'

const Placeholder = styled('div')({
  minWidth: DASH_SIDEBAR.WIDTH,
  maxWidth: DASH_SIDEBAR.WIDTH
})

const Fixed = styled('div')({
  position: 'fixed'
})

interface Props {
  children: ReactNode
}

const StaticSidebar = (props: Props) => {
  const {children} = props
  return (
    <Placeholder>
      <Fixed>{children}</Fixed>
    </Placeholder>
  )
}

export default StaticSidebar
