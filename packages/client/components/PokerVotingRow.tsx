import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '../styles/paletteV2'
import {PokerCards} from '../types/constEnums'
import {PokerVotingRow_scaleValue} from '../__generated__/PokerVotingRow_scaleValue.graphql'
import {PokerVotingRow_scores} from '../__generated__/PokerVotingRow_scores.graphql'
import MiniPokerCard from './MiniPokerCard'
import PokerVotingAvatarGroup from './PokerVotingAvatarGroup'
import PokerVotingRowBase from './PokerVotingRowBase'

interface Props {
  // can be null if the meeting had ended & then the scaleValues were modified
  scaleValue: PokerVotingRow_scaleValue | null
  scores: PokerVotingRow_scores
  setFinalScore?: () => void
  isInitialStageRender: boolean
}

const PokerVotingRow = (props: Props) => {
  const {scaleValue, scores, setFinalScore, isInitialStageRender} = props
  const color = scaleValue?.color ?? PALETTE.BACKGROUND_DARK
  const label = scores[0]?.label ?? PokerCards.DELETED_CARD
  return (
    <PokerVotingRowBase>
      <MiniPokerCard color={color} onClick={setFinalScore} >{label}</MiniPokerCard>
      <PokerVotingAvatarGroup scores={scores} isInitialStageRender={isInitialStageRender} />
    </PokerVotingRowBase>
  )
}

export default createFragmentContainer(
  PokerVotingRow,
  {
    scaleValue: graphql`
    fragment PokerVotingRow_scaleValue on TemplateScaleValue {
      color
    }`,
    scores: graphql`
    fragment PokerVotingRow_scores on EstimateUserScore @relay(plural: true) {
      ...PokerVotingAvatarGroup_scores
      label
    }`
  }
)
