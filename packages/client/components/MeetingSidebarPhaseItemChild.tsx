import styled from '@emotion/styled'
import {BezierCurve} from '../types/constEnums'

const MeetingSidebarPhaseItemChild = styled('div')<{
  height?: string | number
  minHeight?: string | number
}>(({height, minHeight}) => ({
  display: 'flex',
  flexDirection: 'column',
  transition: `height 300ms ${BezierCurve.DECELERATE}, min-height 300ms ${BezierCurve.DECELERATE}`,
  height, // trickle down height for overflow
  minHeight,
  overflow: 'hidden' // required for FF68
}))

export default MeetingSidebarPhaseItemChild
