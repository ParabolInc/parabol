import React from 'react'
import PokerDimensionValueControl from './PokerDimensionValueControl'
import PokerDimensionValueStatic from './PokerDimensionValueStatic'
import PokerVotingRow from './PokerVotingRow'
import {PALETTE} from '~/styles/paletteV2'
import groupPokerScores from '~/utils/groupPokerScores'

interface Props {
  selectedScale: Array<any>
  scores: Array<any>
  teamMembers: Array<any>
}

const PokerDiscussVoting = (props: Props) => {
  const {selectedScale, scores, teamMembers} = props
  const voterGroups = groupPokerScores(scores, selectedScale)
  const isFacilitator = true
  const mockScaleValue = {
    color: PALETTE.PROMPT_BLUE,
    label: '5',
    value: 5
  }
  const mockMostVotedValue = '1'
  return (
    <>
      {isFacilitator
        ? <PokerDimensionValueControl hasFocus={false} placeholder={mockMostVotedValue} scaleValue={null} />
        : <PokerDimensionValueStatic scaleValue={mockScaleValue} />
      }
      {/* Map voting rows */}
      {voterGroups.map(({scaleValue, scores}, idx) => (
        <PokerVotingRow key={idx} scaleValue={scaleValue} scores={scores} teamMembers={teamMembers} />
      ))}
    </>
  )
}

export default PokerDiscussVoting
