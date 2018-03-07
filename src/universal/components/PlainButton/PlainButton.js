import styled from 'react-emotion';

import appTheme from 'universal/styles/theme/appTheme';

const PlainButton = styled('button')({
  appearance: 'none',
  background: 'inherit',
  border: 0,
  borderRadius: 0,
  color: 'inherit',
  cursor: 'pointer',
  fontSize: 'inherit',
  margin: 0,
  padding: 0,
  ':focus': {
    outline: 0,
    boxShadow: `0 0 1px 1px ${appTheme.palette.mid}`
  }
});

export default PlainButton;
