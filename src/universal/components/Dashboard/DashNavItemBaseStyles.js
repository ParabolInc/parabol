import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const DashNavItemBaseStyles = {
  borderLeft: '.1875rem solid transparent',
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  fontSize: ui.navMenuFontSize,
  fontWeight: 600,
  lineHeight: ui.navMenuLineHeight,
  // padding: '.625rem .5rem .625rem 4.5625rem',
  padding: '.625rem .5rem .625rem 2rem',
  transition: `background-color ${ui.transition[0]}`,
  userSelect: 'none',
  width: '100%'
};

export default DashNavItemBaseStyles;
