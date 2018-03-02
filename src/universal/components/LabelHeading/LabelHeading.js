
import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const LabelHeading = styled('div')({
  color: appTheme.palette.dark50a,
  fontSize: '.75rem',
  fontWeight: ui.typeSemiBold,
  letterSpacing: '.03em',
  lineHeight: '1rem',
  textTransform: 'uppercase'
});

export default LabelHeading;
