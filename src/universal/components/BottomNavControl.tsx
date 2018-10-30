import React, {ReactNode} from 'react'
import styled, {keyframes} from 'react-emotion'
import FlatButton, {FlatButtonProps} from 'universal/components/FlatButton'
import withInnerRef from 'universal/decorators/withInnerRef'

const BounceKeyframes = keyframes`
  from, 10%, 26%, 40%, 50%, to {
    animation-timing-function: cubic-bezier(0.0, 0.0, 0.2, 1);
    transform: translate3d(0, 0, 0);
  }

  20%, 22% {
    transform: translate3d(0, -1rem, 0);
  }

  35% {
    transform: translate3d(0, -.5rem, 0);
  }

  45% {
    transform: translate3d(0, -.25rem, 0);
  }
`

const StyledFlatButton = styled(FlatButton)(({isBouncing}: {isBouncing: boolean}) => ({
  animation: isBouncing ? `${BounceKeyframes} 2s infinite` : undefined,
  border: 0,
  borderRadius: 0,
  height: 56,
  minWidth: '6rem',
  padding: 0,
  transformOrigin: 'center bottom'
}))

interface Props extends FlatButtonProps {
  children?: ReactNode
  disabled: boolean
  isBouncing: boolean
}

const BottomNavControl = (props: Props) => {
  const {children, disabled, isBouncing} = props
  return (
    <StyledFlatButton {...props} disabled={disabled} isBouncing={isBouncing}>
      {children}
    </StyledFlatButton>
  )
}

export default (withInnerRef as any)(BottomNavControl)
