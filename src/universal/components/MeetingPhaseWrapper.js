import ui from 'universal/styles/ui';
import styled from 'react-emotion';

const MeetingPhaseWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'space-around',
  margin: '0 auto',
  maxWidth: ui.meetingTopicPhaseMaxWidth,
  width: '100%'
});

export default MeetingPhaseWrapper;
