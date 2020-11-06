import React from 'react'
import PokerVotingAvatarGroup from './PokerVotingAvatarGroup'
import PokerVotingRowBase from './PokerVotingRowBase'
import MiniPokerCard from './MiniPokerCard'

interface Props {
  scaleValue: any
  voters: any
}

const PokerVotingRow = (props: Props) => {
  const {scaleValue, voters} = props
  return (
    <PokerVotingRowBase>
      <MiniPokerCard scaleValue={scaleValue} />
      <PokerVotingAvatarGroup voters={voters} />
    </PokerVotingRowBase>
  )
}

export default PokerVotingRow
