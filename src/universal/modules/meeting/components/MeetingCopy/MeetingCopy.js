import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const MeetingCopy = styled('div')(({margin}) => ({
  color: ui.colorText,
  fontSize: appTheme.typography.sBase,
  lineHeight: 1.3,
  margin: margin || '1em 0'
}));

export default MeetingCopy;
