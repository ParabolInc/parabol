import styled from '@emotion/styled'
import {BezierCurve} from '../types/constEnums'

// const MeetingSidebarPhaseItemChild = styled('div')<{isActive: boolean}>(({isActive}) => ({
const MeetingSidebarPhaseItemChild = styled('div')<{isActive?: boolean}>(({isActive}) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: isActive ? 40 : 0, // trickle down height for overflow: ;
  overflow: 'hidden', // required for FF68
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  transitionDelay: isActive ? '200ms' : '0ms'
}))

export default MeetingSidebarPhaseItemChild
