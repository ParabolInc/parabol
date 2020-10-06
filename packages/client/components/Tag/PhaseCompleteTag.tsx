import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV2'

const PhaseCompleteTag = styled('div')({
  alignItems: 'center',
  background: PALETTE.BACKGROUND_GRAY,
  borderRadius: 4,
  color: '#fff',
  display: 'flex',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
  marginBottom: 8,
  maxHeight: 28,
  padding: '4px 16px'
})

export default PhaseCompleteTag
