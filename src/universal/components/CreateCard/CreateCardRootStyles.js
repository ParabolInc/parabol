import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';

const CreateCardRootStyles = {
  alignItems: 'center',
  backgroundColor: '#fff',
  border: `1px solid ${theme.palette.mid40l}`,
  borderRadius: '.5rem',
  borderTop: `.25rem solid ${theme.palette.mid40l}`,
  display: 'flex !important',
  justifyContent: 'center',
  // TODO: Cards need block containers, not margin (TA)
  margin: '0 0 .5rem',
  maxWidth: '20rem',
  minHeight: ui.cardMinHeight,
  padding: '.5rem 1.25rem',
  width: '100%'
};

export default CreateCardRootStyles;
