import styled from '@emotion/styled'
import {keyframes} from '@emotion/core'
import FlatButton, {FlatButtonProps} from './FlatButton'
import {TransitionStatus} from 'hooks/useTransition'
import {BezierCurve} from 'types/constEnums'

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
  status: TransitionStatus
}

const BottomNavControl = styled(FlatButton)<Props>(({isBouncing, status}) => ({
  animation: isBouncing ? `${BounceKeyframes.toString()} 2s infinite` : undefined,
  border: 0,
  borderRadius: 0,
  minHeight: 56,
  width: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 90,
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  padding: 0,
  transformOrigin: 'center bottom',
  transition: `all 300ms ${BezierCurve.DECELERATE}`
}))

export default BottomNavControl
