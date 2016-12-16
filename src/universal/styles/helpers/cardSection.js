import ui from 'universal/styles/ui';
import {cardBorderTop} from 'universal/styles/helpers';

const cardSection = {
  display: 'flex',
  flexDirection: 'column',
  margin: '1rem 0',
  backgroundColor: '#fff',
  border: `1px solid ${ui.cardBorderColor}`,
  borderRadius: ui.cardBorderRadius,
  minHeight: ui.cardMinHeight,
  paddingTop: '.1875rem',
  position: 'relative',
  width: '100%',

  '::after': {
    ...cardBorderTop
  },
};

export default cardSection;
