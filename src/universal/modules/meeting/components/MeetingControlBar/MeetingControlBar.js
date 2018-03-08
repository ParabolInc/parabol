import styled from 'react-emotion';
import ui from 'universal/styles/ui';

const MeetingControlBar = styled('div')(({margin}) => ({
  backgroundColor: ui.palette.white,
  boxShadow: ui.meetingChromeBoxShadow,
  borderTop: `.0625rem solid ${ui.meetingBorderColor}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '4rem', // 3.125rem
  padding: '0 1.25rem',
  width: '100%'
}));

export default MeetingControlBar;
