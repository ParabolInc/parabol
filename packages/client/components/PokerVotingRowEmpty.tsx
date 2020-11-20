import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV2'
import MiniPokerCard from './MiniPokerCard'
import PokerVotingRowBase from './PokerVotingRowBase'

const HeaderLabel = styled('div')({
  color: PALETTE.TEXT_GRAY,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '24px',
  paddingLeft: 16
})

const PokerVotingRowEmpty = () =>
  <PokerVotingRowBase>
    <MiniPokerCard>{'?'}</MiniPokerCard>
    <HeaderLabel>{'No Votes'}</HeaderLabel>
  </PokerVotingRowBase>

export default PokerVotingRowEmpty
