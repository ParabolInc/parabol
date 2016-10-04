import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const cardBorderTop = {
  backgroundColor: 'currentColor',
  borderRadius: `${ui.cardBorderRadius} ${ui.cardBorderRadius} 0 0`,
  display: 'block',
  color: appTheme.palette.dark,
  content: '""',
  height: ui.cardBorderRadius,
  left: '-1px',
  position: 'absolute',
  right: '-1px',
  top: '-1px',
};

export default cardBorderTop;
