import styled from 'react-emotion';
import ui from 'universal/styles/ui';

const SettingsWrapper = styled('div')(({maxWidth}) => ({
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
  maxWidth: maxWidth || ui.settingsPanelMaxWidth,
  width: '100%'
}));

export default SettingsWrapper;
