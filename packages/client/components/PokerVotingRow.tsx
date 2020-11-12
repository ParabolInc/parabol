import React from 'react'
import PokerVotingAvatarGroup from './PokerVotingAvatarGroup'
import PokerVotingRowBase from './PokerVotingRowBase'
import MiniPokerCard from './MiniPokerCard'
import getPokerVoters from '~/utils/getPokerVoters'

interface Props {
  scaleValue: any
  scores: Array<any>
  teamMembers: Array<any>
}

const PokerVotingRow = (props: Props) => {
  const {scaleValue, scores, teamMembers} = props
  const voters = getPokerVoters(scores, teamMembers)
  return (
    <PokerVotingRowBase>
      <MiniPokerCard scaleValue={scaleValue} />
      <PokerVotingAvatarGroup voters={voters} />
    </PokerVotingRowBase>
  )
}

export default PokerVotingRow
