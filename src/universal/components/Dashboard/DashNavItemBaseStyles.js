import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const DashNavItemBaseStyles = {
  borderRadius: `${ui.buttonBorderRadius} 0 0 ${ui.buttonBorderRadius}`,
  color: 'inherit',
  display: 'block',
  fontSize: ui.navMenuFontSize,
  fontWeight: 600,
  margin: '.5rem 0',
  padding: '.3125rem .5rem .3125rem 1rem',
  transition: `background-color ${ui.transition[0]}`,
  userSelect: 'none',
  width: '100%'
};

export default DashNavItemBaseStyles;
