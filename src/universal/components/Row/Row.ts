import styled from 'react-emotion'
import {ROW_BORDER_COLOR, ROW_GUTTER} from 'universal/styles/rows'

const Row = styled('div')({
  alignItems: 'center',
  borderTop: `1px solid ${ROW_BORDER_COLOR}`,
  display: 'flex',
  justifyContent: 'space-between',
  padding: ROW_GUTTER,
  width: '100%'
})

export default Row
