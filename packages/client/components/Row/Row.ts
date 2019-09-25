import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV2'
import {Layout} from '../../types/constEnums'

const Row = styled('div')({
  alignItems: 'center',
  borderTop: `1px solid ${PALETTE.BORDER_LIGHTER}`,
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  padding: Layout.ROW_GUTTER,
  width: '100%'
})

export default Row
