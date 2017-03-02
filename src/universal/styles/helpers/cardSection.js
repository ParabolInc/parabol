import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import {cardBorderTop} from 'universal/styles/helpers';

const cardSection = {
  display: 'flex',
  flexDirection: 'column',
  margin: '1rem 0',
  backgroundColor: '#fff',
  border: `1px solid ${appTheme.palette.mid40l}`,
  borderRadius: ui.cardBorderRadius,
  minHeight: ui.cardMinHeight,
  paddingTop: '.1875rem',
  position: 'relative',
  width: '100%',

  '::after': {
    ...cardBorderTop,
    color: appTheme.palette.mid40l,
  },
};

export default cardSection;
