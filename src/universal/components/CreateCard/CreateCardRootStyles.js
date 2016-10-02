import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {cardBorderTop} from 'universal/styles/helpers';

const CreateCardRootStyles = {
  alignItems: 'center',
  backgroundColor: '#fff',
  border: `1px solid ${appTheme.palette.mid40l}`,
  borderRadius: ui.cardBorderRadius,
  borderTop: `1px solid ${appTheme.palette.mid40l}`,
  display: 'flex !important',
  justifyContent: 'center',
  // TODO: Cards need block containers, not margin (TA)
  margin: '0 0 .5rem',
  maxWidth: '20rem',
  minHeight: ui.cardMinHeight,
  padding: '.6875rem 1.25rem .5rem',
  position: 'relative',
  width: '100%',

  '::after': {
    ...cardBorderTop,
    color: appTheme.palette.mid40l
  }
};

export default CreateCardRootStyles;
