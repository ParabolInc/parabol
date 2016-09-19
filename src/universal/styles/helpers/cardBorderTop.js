import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';

const cardBorderTop = {
  backgroundColor: 'currentColor',
  borderRadius: `${ui.cardBorderRadius} ${ui.cardBorderRadius} 0 0`,
  display: 'block',
  color: theme.palette.dark,
  content: '""',
  height: ui.cardBorderRadius,
  left: '-1px',
  position: 'absolute',
  right: '-1px',
  top: '-1px',
};

export default cardBorderTop;
