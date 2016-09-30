import {cardRootStyles} from 'universal/styles/helpers';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';

const CreateCardRootStyles = {
  ...cardRootStyles,
  alignItems: 'center',
  borderColor: theme.palette.mid40l,
  display: 'flex !important',
  justifyContent: 'center',
  // TODO: Cards need block containers, not margin (TA)
  margin: '0 0 .5rem',
  maxWidth: '20rem',
  minHeight: ui.cardMinHeight,
  padding: '.6875rem 1.25rem .5rem'
};

export default CreateCardRootStyles;
