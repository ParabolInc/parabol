import React from 'react'
import PokerDimensionValueControl from './PokerDimensionValueControl'
import PokerDimensionValueStatic from './PokerDimensionValueStatic'
import PokerVotingRow from './PokerVotingRow'
import {PALETTE} from '~/styles/paletteV2'
import groupPokerScores from '~/utils/groupPokerScores'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {PokerDiscussVoting_meeting} from '../__generated__/PokerDiscussVoting_meeting.graphql'
import {PokerDiscussVoting_stage} from '../__generated__/PokerDiscussVoting_stage.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'

interface Props {
  meeting: PokerDiscussVoting_meeting
  setVotedUserEl: (userId: string, el: HTMLDivElement) => void
  stage: PokerDiscussVoting_stage
}

const PokerDiscussVoting = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {meeting, setVotedUserEl, stage} = props
  const {facilitatorUserId} = meeting
  const {dimension, scores} = stage
  const {selectedScale} = dimension
  const {values: scaleValues} = selectedScale
  const voterGroups = groupPokerScores(scores, scaleValues)
  const isFacilitator = viewerId === facilitatorUserId

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
      {voterGroups.map(({scaleValue, groupScores}, idx) => (
        <PokerVotingRow key={idx} setVotedUserEl={setVotedUserEl} scaleValue={scaleValue} scores={groupScores} meeting={meeting} />
      ))}
    </>
  )
}

export default createFragmentContainer(
  PokerDiscussVoting,
  {
    meeting: graphql`
    fragment PokerDiscussVoting_meeting on PokerMeeting {
      ...PokerVotingRow_meeting
      facilitatorUserId
    }`,
    stage: graphql`
    fragment PokerDiscussVoting_stage on EstimateStage {
      dimension {
        selectedScale {
          values {
            color
            label
            value
          }
        }
      }
      scores {
        userId
        label
        value
      }
    }
    `
  }
)
