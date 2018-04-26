import ui from 'universal/styles/ui';
import styled from 'react-emotion';

const Row = styled('div')(({compact}) => ({
  alignItems: 'center',
  borderTop: `.0625rem solid ${ui.rowBorderColor}`,
  display: 'flex',
  justifyContent: 'space-between',
  padding: compact ? ui.rowCompactGutter : ui.rowGutter,
  width: '100%'
}));

export default Row;
