import styled from 'react-emotion';
import ui from 'universal/styles/ui';

const SettingsWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
  maxWidth: ui.settingsPanelMaxWidth,
  width: '100%'
});

export default SettingsWrapper;
