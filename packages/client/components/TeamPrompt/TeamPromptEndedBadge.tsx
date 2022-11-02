import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'

const TeamPromptEndedRoot = styled('div')({
  borderRadius: 24,
  height: 48,
  backgroundColor: PALETTE.WHITE,
  color: PALETTE.SLATE_700,
  fontWeight: 500,
  fontSize: 14,
  padding: '8px 16px 8px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 'auto 0'
})

export const TeamPromptEndedBadge = () => {
  return <TeamPromptEndedRoot>✅ This activity has ended.</TeamPromptEndedRoot>
}
