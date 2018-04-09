import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import styled from 'react-emotion';

const SimpleMeetingPrompt = styled('div')({
  backgroundColor: appTheme.brand.primary.purple,
  backgroundImage: ui.gradientPurple,
  borderRadius: '1rem 1rem 1rem 0',
  color: ui.palette.white,
  fontSize: appTheme.typography.s2,
  lineHeight: appTheme.typography.s5,
  margin: 'auto',
  padding: '.5rem 1rem'
});

export default SimpleMeetingPrompt;
