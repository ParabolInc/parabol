import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'
import {Layout} from 'universal/types/constEnums'

const Row = styled('div')({
  alignItems: 'center',
  borderTop: `1px solid ${PALETTE.BORDER_LIGHTER}`,
  display: 'flex',
  justifyContent: 'space-between',
  padding: Layout.ROW_GUTTER,
  width: '100%'
})

export default Row
