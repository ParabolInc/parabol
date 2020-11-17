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

interface Props {
  meeting: PokerDiscussVoting_meeting
  stage: PokerDiscussVoting_stage
}

const PokerDiscussVoting = (props: Props) => {
  const {meeting, stage} = props
  const {team, settings} = meeting
  const {dimensionId, scores} = stage
  const {teamMembers} = team
  const {selectedTemplate} = settings
  const {dimensions} = selectedTemplate
  const {selectedScale} = dimensions.find(({id}) => id === dimensionId)
  const {values: scaleValues} = selectedScale

  const voterGroups = groupPokerScores(scores, scaleValues)
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
      {voterGroups.map(({scaleValue, groupScores}, idx) => (
        <PokerVotingRow key={idx} scaleValue={scaleValue} scores={groupScores} teamMembers={teamMembers} />
      ))}
    </>
  )
}

export default createFragmentContainer(
  PokerDiscussVoting,
  {
    meeting: graphql`
    fragment PokerDiscussVoting_meeting on PokerMeeting {
      team {
        teamMembers {
          userId
          picture
        }
      }
      settings {
        selectedTemplate {
          dimensions {
            id
            name
            selectedScale {
              values {
                color
                label
                value
              }
            }
          }
        }
      }
    }`,
    stage: graphql`
    fragment PokerDiscussVoting_stage on EstimateStage {
      isVoting
      dimensionId
      scores {
        userId
        label
        value
      }
    }
    `
  }
)
