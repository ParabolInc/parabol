import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import {
  meetingBorderColor,
  meetingBottomBarHeight,
  meetingChromeBoxShadowInset
} from 'universal/styles/meeting'

const MeetingControlBar = styled('div')({
  alignItems: 'center',
  backgroundColor: ui.palette.white,
  borderTop: `.0625rem solid ${meetingBorderColor}`,
  boxShadow: meetingChromeBoxShadowInset,
  boxSizing: 'content-box',
  color: ui.hintColor,
  display: 'flex',
  flexWrap: 'nowrap',
  fontSize: '.8125rem',
  justifyContent: 'center',
  minHeight: meetingBottomBarHeight,
  overflowX: 'auto',
  width: '100%'
})

export default MeetingControlBar
