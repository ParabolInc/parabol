import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV3'

export const TeamPromptBadge = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: 14,
  fontWeight: 600,
  padding: '4px 16px 4px 16px',
  backgroundColor: PALETTE.WHITE,
  color: PALETTE.SLATE_700,
  borderRadius: 26,
  height: 32
})
