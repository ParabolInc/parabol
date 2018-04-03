import styled from 'react-emotion';
import ui from 'universal/styles/ui';

const MeetingControlBar = styled('div')({
  alignItems: 'center',
  backgroundColor: ui.palette.white,
  borderTop: `.0625rem solid ${ui.meetingBorderColor}`,
  boxShadow: ui.meetingChromeBoxShadow,
  color: ui.hintFontColor,
  display: 'flex',
  fontSize: '.9375rem',
  justifyContent: 'center',
  minHeight: '4rem', // 3.125rem
  padding: '0 1.25rem',
  width: '100%'
});

export default MeetingControlBar;
