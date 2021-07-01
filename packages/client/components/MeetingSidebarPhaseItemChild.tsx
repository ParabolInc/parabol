import styled from '@emotion/styled'
import {BezierCurve} from '../types/constEnums'

const MeetingSidebarPhaseItemChild = styled('div')<{
  isActive?: boolean
  height?: number
}>(({isActive, height = '100%'}) => ({
  display: 'flex',
  flexDirection: 'column',
  height: isActive ? height : 0,
  overflow: 'hidden', // required for FF68
  transition: `all 300ms ${BezierCurve.DECELERATE}`
}))

export default MeetingSidebarPhaseItemChild
