import styled from '@emotion/styled'
import {bottomBarShadow, desktopBarShadow} from '../../../../styles/elevation'
import {PALETTE} from '../../../../styles/paletteV2'
import {Breakpoint} from '../../../../types/constEnums'

const MeetingFacilitatorBar = styled('div')({
  alignItems: 'center',
  backgroundColor: '#fff',
  boxShadow: bottomBarShadow,
  boxSizing: 'content-box',
  color: PALETTE.TEXT_LIGHT,
  display: 'flex',
  flexWrap: 'nowrap',
  fontSize: 13,
  justifyContent: 'space-between',
  minHeight: 56,
  overflowX: 'auto',
  width: '100%',
  zIndex: 8,

  [`@media screen and (min-width: ${Breakpoint.MEETING_FACILITATOR_BAR}px)`]: {
    boxShadow: desktopBarShadow,
    zIndex: 4
  }
})

export default MeetingFacilitatorBar
