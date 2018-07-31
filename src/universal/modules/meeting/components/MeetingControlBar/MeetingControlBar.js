import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import {meetingBorderColor, meetingChromeBoxShadowInset} from 'universal/styles/meeting'
import {minWidthMediaQueries} from 'universal/styles/breakpoints'

const MeetingControlBar = styled('div')({
  alignItems: 'center',
  backgroundColor: ui.palette.white,
  borderTop: `.0625rem solid ${meetingBorderColor}`,
  boxShadow: meetingChromeBoxShadowInset,
  color: ui.hintColor,
  display: 'flex',
  flexWrap: 'nowrap',
  fontSize: '.8125rem',
  justifyContent: 'center',
  minHeight: '4.0625rem', // 3.125rem
  overflowX: 'auto',
  padding: '0 1rem',
  width: '100%',
  [minWidthMediaQueries[1]]: {
    padding: '0 1.25rem'
  }
})

export default MeetingControlBar
