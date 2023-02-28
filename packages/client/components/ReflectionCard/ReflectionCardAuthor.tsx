import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV3'

const Author = styled('div')({
  padding: '12px 16px',
  color: PALETTE.SLATE_600,
  fontSize: 14,
  fontWeight: 700,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden'
})

export default Author
