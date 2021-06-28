import styled from '@emotion/styled'
import {BezierCurve} from '../types/constEnums'

// const MeetingSidebarPhaseItemChild = styled('div')<{isActive: boolean}>(({isActive}) => ({
const MeetingSidebarPhaseItemChild = styled('div')<{isActive?: boolean}>(({isActive}) => ({
  display: 'flex',
  flexDirection: 'column',
  maxHeight: isActive ? 1000 : 0, // trickle down height for overflow: ;
  overflow: 'hidden', // required for FF68
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  transitionDelay: '200ms'
}))

export default MeetingSidebarPhaseItemChild
