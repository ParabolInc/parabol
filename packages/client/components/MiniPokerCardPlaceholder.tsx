import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV2'

const MiniPokerCardPlaceholder = styled('div')({
  alignItems: 'center',
  background: 'white',
  border: `1px dashed ${PALETTE.TEXT_GRAY}`,
  borderRadius: 2,
  color: PALETTE.TEXT_GRAY,
  display: 'flex',
  flexShrink: 0,
  fontWeight: 600,
  height: 40,
  fontSize: 18,
  justifyContent: 'center',
  lineHeight: '24px',
  textAlign: 'center',
  width: 28
})

export default MiniPokerCardPlaceholder
