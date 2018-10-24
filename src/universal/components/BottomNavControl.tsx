import React from 'react'
import styled from 'react-emotion'
import FlatButton from 'universal/components/FlatButton'
import withInnerRef from 'universal/decorators/withInnerRef'

const StyledFlatButton = styled(FlatButton)({
  border: 0,
  borderRadius: 0,
  height: 56,
  minWidth: 80,
  padding: 0
})

interface Props {
  children: any | undefined
  className: string | undefined
}

const BottomNavControl = (props: Props) => {
  const {children, className} = props
  return (
    <StyledFlatButton {...props} className={className}>
      {children}
    </StyledFlatButton>
  )
}

export default withInnerRef(BottomNavControl)
