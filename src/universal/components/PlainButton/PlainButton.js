import styled from 'react-emotion';

import appTheme from 'universal/styles/theme/appTheme';

const PlainButton = styled('button')({
  appearance: 'none',
  background: 'inherit',
  border: 0,
  borderRadius: 0,
  color: 'inherit',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  margin: 0,
  padding: 0,
  ':focus': {
    boxShadow: `0 0 .0625rem .0625rem ${appTheme.palette.mid}`,
    outline: 0
  },
  textAlign: 'inherit'
});

export default PlainButton;
