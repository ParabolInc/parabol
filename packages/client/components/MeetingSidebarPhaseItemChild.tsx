import styled from '@emotion/styled'
import {BezierCurve} from '../types/constEnums'

// const MeetingSidebarPhaseItemChild = styled('div')<{isActive: boolean}>(({isActive}) => ({
const MeetingSidebarPhaseItemChild = styled('div')<{isActive?: boolean}>(({isActive}) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: isActive ? 40 : 0, // trickle down height for overflow: ;
  maxHeight: isActive ? 1000 : 0,
  overflow: 'hidden', // required for FF68
  transition: `all 300ms ${isActive ? BezierCurve.ACCELERATE : BezierCurve.DECELERATE}`,
  transitionDelay: isActive ? '150ms' : '0ms'
}))

export default MeetingSidebarPhaseItemChild
