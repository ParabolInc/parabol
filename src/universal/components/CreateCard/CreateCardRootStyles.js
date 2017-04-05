import {cardRootStyles} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';

const CreateCardRootStyles = {
  ...cardRootStyles,
  alignItems: 'center',
  border: 0,
  borderTop: '1px solid',
  boxShadow: ui.cardBoxShadow,
  display: 'flex !important',
  justifyContent: 'center',
  // TODO: Cards need block containers, not margin (TA)
  margin: '0 0 .5rem',
  maxWidth: ui.cardMaxWidth,
  minHeight: ui.cardMinHeight,
  padding: '.6875rem 1.25rem .5rem'
};

export default CreateCardRootStyles;
