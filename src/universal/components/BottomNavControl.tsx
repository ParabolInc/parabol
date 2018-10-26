import React, {ReactNode} from 'react'
import styled from 'react-emotion'
import FlatButton, {FlatButtonProps} from 'universal/components/FlatButton'
import withInnerRef from 'universal/decorators/withInnerRef'

const StyledFlatButton = styled(FlatButton)({
  border: 0,
  borderRadius: 0,
  height: 56,
  minWidth: '6rem',
  padding: 0
})

interface Props extends FlatButtonProps {
  children?: ReactNode
  disabled: boolean
}

const BottomNavControl = (props: Props) => {
  const {children, disabled} = props
  return (
    <StyledFlatButton {...props} disabled={disabled}>
      {children}
    </StyledFlatButton>
  )
}

export default (withInnerRef as any)(BottomNavControl)
