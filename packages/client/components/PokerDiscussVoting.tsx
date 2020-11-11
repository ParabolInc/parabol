import React from 'react'
import PokerDimensionValueControl from './PokerDimensionValueControl'
import PokerDimensionValueStatic from './PokerDimensionValueStatic'
import PokerVotingRow from './PokerVotingRow'
import {PALETTE} from '~/styles/paletteV2'
import getDemoAvatar from '~/utils/getDemoAvatar'

const MAX_32_BIT_INTEGER = Math.pow(2, 31) - 1

const group0 = [
  getDemoAvatar(0)
]

const group1 = [
  getDemoAvatar(1)
]

const group2 = [
  getDemoAvatar(2),
  getDemoAvatar(3),
  getDemoAvatar(4)
]

const group3 = [
  getDemoAvatar(5),
  getDemoAvatar(6),
  getDemoAvatar(7),
  getDemoAvatar(8),
  getDemoAvatar(9)
]

const group4 = [
  getDemoAvatar(10),
  getDemoAvatar(11),
  getDemoAvatar(12),
  getDemoAvatar(13),
  getDemoAvatar(14),
  getDemoAvatar(15),
  getDemoAvatar(16),
  getDemoAvatar(17),
  getDemoAvatar(18),
  getDemoAvatar(19),
  getDemoAvatar(20),
  getDemoAvatar(21),
  getDemoAvatar(22),
  getDemoAvatar(23),
  getDemoAvatar(24),
  getDemoAvatar(25),
  getDemoAvatar(26)
]

const votingResults = [
  {
    scaleValue: {value: -1, label: "?", color: PALETTE.PROMPT_BLUE},
    voters: group0
  },
  {
    scaleValue: {value: 5, label: "5", color: PALETTE.PROMPT_BLUE},
    voters: group1
  },
  {
    scaleValue: {value: 3, label: "3", color: PALETTE.PROMPT_BLUE},
    voters: group2
  },
  {
    scaleValue: {value: 1, label: "1", color: PALETTE.PROMPT_BLUE},
    voters: group3
  },
  {
    scaleValue: {value: MAX_32_BIT_INTEGER, label: "🚫", color: PALETTE.PROMPT_BLUE},
    voters: group4
  }
]

const PokerDiscussVoting = () => {
  const isFacilitator = true
  const scaleValue = {
    color: PALETTE.PROMPT_BLUE,
    label: '5',
    value: 5
  }
  const mostCommonVotedValue = '1'
  return (
    <>
      {isFacilitator
        ? <PokerDimensionValueControl hasFocus={false} placeholder={mostCommonVotedValue} scaleValue={null} />
        : <PokerDimensionValueStatic scaleValue={scaleValue} />
      }
      {/* Map voting rows */}
      {votingResults.map(({scaleValue, voters}, idx) => (
        <PokerVotingRow key={idx} scaleValue={scaleValue} voters={voters} />
      ))}
    </>
  )
}

export default PokerDiscussVoting
