import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const DashNavItemBaseStyles = {
  backgroundColor: ui.dashSidebarBackgroundColor,
  borderRadius: `${ui.buttonBorderRadius} 0 0 ${ui.buttonBorderRadius}`,
  color: 'inherit',
  display: 'block',
  fontSize: appTheme.typography.s4,
  margin: '.5rem 0',
  padding: '.3125rem .5rem .3125rem 1rem',
  transition: `background-color ${ui.transitionFastest}`,
  userSelect: 'none',
  width: '100%',
};

export default DashNavItemBaseStyles;
