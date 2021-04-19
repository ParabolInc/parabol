import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '../styles/paletteV3'
import {PokerCards} from '../types/constEnums'
import {PokerVotingRow_scaleValue} from '../__generated__/PokerVotingRow_scaleValue.graphql'
import {PokerVotingRow_scores} from '../__generated__/PokerVotingRow_scores.graphql'
import AvatarList from './AvatarList'
import MiniPokerCard from './MiniPokerCard'
import PokerVotingNoVotes from './PokerVotingNoVotes'
import PokerVotingRowBase from './PokerVotingRowBase'

interface Props {
  scaleValue: PokerVotingRow_scaleValue
  scores: PokerVotingRow_scores
  setFinalScore?: () => void
  isInitialStageRender: boolean
}

const PokerVotingRow = (props: Props) => {
  const {scaleValue, scores, setFinalScore, isInitialStageRender} = props
  const {label, color} = scaleValue
  const users = scores.map(({user}) => user)
  return (
    <PokerVotingRowBase>
      <MiniPokerCard color={color} onClick={setFinalScore}>
        {label}
      </MiniPokerCard>
      <AvatarList
        size={PokerCards.AVATAR_WIDTH as 46}
        users={users}
        isAnimated={!isInitialStageRender}
        borderColor={PALETTE.SLATE_300}
        emptyEl={<PokerVotingNoVotes />}
      />
    </PokerVotingRowBase>
  )
}

export default createFragmentContainer(PokerVotingRow, {
  scaleValue: graphql`
    fragment PokerVotingRow_scaleValue on TemplateScaleValue {
      color
      label
    }
  `,
  scores: graphql`
    fragment PokerVotingRow_scores on EstimateUserScore @relay(plural: true) {
      user {
        ...AvatarList_users
      }
    }
  `
})
