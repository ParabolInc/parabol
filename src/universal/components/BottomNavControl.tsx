import styled, {keyframes} from 'react-emotion'
import FlatButton, {FlatButtonProps} from 'universal/components/FlatButton'

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

interface Props extends FlatButtonProps {
  isBouncing?: boolean
}

const BottomNavControl = styled(FlatButton)(({isBouncing}: Props) => ({
  animation: isBouncing ? `${BounceKeyframes} 2s infinite` : undefined,
  border: 0,
  borderRadius: 0,
  height: 56,
  minWidth: '6rem',
  padding: 0,
  transformOrigin: 'center bottom'
}))

export default BottomNavControl
