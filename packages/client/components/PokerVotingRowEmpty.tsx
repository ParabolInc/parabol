import React from 'react'
import styled from '@emotion/styled'
import MiniPokerCardPlaceholder from './MiniPokerCardPlaceholder'
import PokerVotingRowBase from './PokerVotingRowBase'
import {PALETTE} from '~/styles/paletteV2'

const HeaderLabel = styled('div')({
  color: PALETTE.TEXT_GRAY,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '24px',
  paddingLeft: 16
})

const PokerVotingRowEmpty = () =>
  <PokerVotingRowBase>
    <MiniPokerCardPlaceholder>{'?'}</MiniPokerCardPlaceholder>
    <HeaderLabel>{'No Votes'}</HeaderLabel>
  </PokerVotingRowBase>

export default PokerVotingRowEmpty
