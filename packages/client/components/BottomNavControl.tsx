import styled from '@emotion/styled'
import {TransitionStatus} from '~/hooks/useTransition'
import {BezierCurve} from '~/types/constEnums'
import FlatButton, {FlatButtonProps} from './FlatButton'

interface Props extends FlatButtonProps {
  confirming?: boolean
  status: TransitionStatus
}

const BottomNavControl = styled(FlatButton)<Props>(({status, confirming}) => ({
  border: 0,
  borderRadius: 0,
  minHeight: 56,
  width: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 90,
  opacity: confirming
    ? 0.5
    : status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING
    ? 0
    : 1,
  padding: 0,
  transformOrigin: 'center bottom',
  transition: `all 300ms ${BezierCurve.DECELERATE}`
}))

export default BottomNavControl
