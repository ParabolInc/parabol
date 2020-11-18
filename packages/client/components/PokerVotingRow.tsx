import React from 'react'
import PokerVotingAvatarGroup from './PokerVotingAvatarGroup'
import PokerVotingRowBase from './PokerVotingRowBase'
import MiniPokerCard from './MiniPokerCard'
import getPokerVoters from '~/utils/getPokerVoters'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {PokerVotingRow_meeting} from '../__generated__/PokerVotingRow_meeting.graphql'

interface ScaleValue {
  color: string
  label: string
  value: number
}

interface Props {
  meeting: PokerVotingRow_meeting
  scaleValue: ScaleValue
  scores: Array<any>
  setVotedUserEl: (userId: string, el: HTMLDivElement) => void
}

const PokerVotingRow = (props: Props) => {
  const {meeting, setVotedUserEl, scaleValue, scores} = props
  const {team} = meeting
  const {teamMembers} = team
  const voters = getPokerVoters(scores, teamMembers)
  return (
    <PokerVotingRowBase>
      <MiniPokerCard scaleValue={scaleValue} />
      <PokerVotingAvatarGroup setVotedUserEl={setVotedUserEl} voters={voters} />
    </PokerVotingRowBase>
  )
}

export default createFragmentContainer(
  PokerVotingRow,
  {
    meeting: graphql`
    fragment PokerVotingRow_meeting on PokerMeeting {
      team {
        teamMembers {
          userId
          picture
        }
      }
    }`
  }
)
