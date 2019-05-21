import React, {ReactNode} from 'react'
import styled from 'react-emotion'

const FlexDiv = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  /* zIndex notes: patch fix for responsive layout shortcomings
     similar to team dashboard patch, users can scroll task columns
     on small viewports */
  zIndex: 200
})

interface Props {
  children: ReactNode
  className?: string
}

const DashMain = (props: Props) => {
  const {children, className} = props
  return <FlexDiv className={className}>{children}</FlexDiv>
}

export default DashMain
