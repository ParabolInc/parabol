import styled from '@emotion/styled'
import {bottomBarShadow, desktopBarShadow} from '../../../../styles/elevation'
import {PALETTE} from '../../../../styles/paletteV2'
import {Breakpoint, ZIndex} from '../../../../types/constEnums'
import React, {ReactNode} from 'react'

const MeetingFacilitatorBarStyles = styled('div')({
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  boxShadow: bottomBarShadow,
  boxSizing: 'content-box',
  color: PALETTE.TEXT_GRAY,
  display: 'flex',
  flexWrap: 'nowrap',
  fontSize: 13,
  justifyContent: 'space-between',
  minHeight: 56,
  overflowX: 'auto',
  width: '100%',
  zIndex: ZIndex.BOTTOM_BAR,

  [`@media screen and (min-width: ${Breakpoint.MEETING_FACILITATOR_BAR}px)`]: {
    boxShadow: desktopBarShadow,
    zIndex: ZIndex.BOTTOM_BAR_DESKTOP
  }
})

interface Props {
  isFacilitating: boolean
  children: ReactNode
}

const MeetingFacilitatorBar = (props: Props) => {
  const {isFacilitating, children} = props
  if (!isFacilitating) return null
  return <MeetingFacilitatorBarStyles>{children}</MeetingFacilitatorBarStyles>
}
export default MeetingFacilitatorBar
