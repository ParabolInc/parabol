import styled from 'react-emotion';

const Grid = styled('div')({
  alignItems: 'start',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gridTemplateRows: '1fr 1fr 1fr',
  height: '100%',
  justifyItems: 'start'
});

export default Grid;
