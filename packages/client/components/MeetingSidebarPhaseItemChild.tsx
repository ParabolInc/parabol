import styled from '@emotion/styled'
import {BezierCurve} from '../types/constEnums'

const MeetingSidebarPhaseItemChild = styled('div')<{isActive?: boolean; maxHeight?: number}>(
  ({isActive, maxHeight}) => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: isActive ? 40 : 0, // trickle down height for overflow: ;
    maxHeight: isActive ? (maxHeight ? maxHeight : '100%') : 0,
    overflow: 'hidden', // required for FF68
    transition: `all 300ms ${BezierCurve.DECELERATE}`
  })
)

export default MeetingSidebarPhaseItemChild
