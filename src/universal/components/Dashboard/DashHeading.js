import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const DashHeading = styled('div')(({textAlign}) => ({
  color: ui.colorText,
  fontFamily: appTheme.typography.serif,
  fontSize: appTheme.typography.s6,
  fontWeight: ui.typeSemiBold,
  lineHeight: '1.25',
  textAlign,
  [ui.dashBreakpoint]: {
    fontSize: appTheme.typography.s7
  }
}));

export default DashHeading;
