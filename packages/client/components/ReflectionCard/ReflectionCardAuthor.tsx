import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV3'

const Author = styled('div')({
  padding: '2px 16px',
  color: PALETTE.SLATE_600,
  fontSize: 13,
  fontWeight: 600,
  lineHeight: '20px',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden'
})

export default Author
