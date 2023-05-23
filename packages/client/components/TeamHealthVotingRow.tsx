import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '../styles/paletteV3'
import {PokerCards} from '../types/constEnums'
import {TeamHealthVotingRow_scores$key} from '../__generated__/TeamHealthVotingRow_scores.graphql'
import AvatarList from './AvatarList'
import {Check as CheckIcon} from '@mui/icons-material'
import MiniPokerCard from './MiniPokerCard'
import PokerVotingNoVotes from './PokerVotingNoVotes'
import PokerVotingRowBase from './PokerVotingRowBase'

interface Props {
  scores: TeamHealthVotingRow_scores$key
  isInitialStageRender?: boolean
}

const MiniCardWrapper = styled('div')({
  // This adds the gutter between the mini card and the avatars
  marginRight: 16
})

const PokerVotingRow = (props: Props) => {
  const {scores: scoresRef, isInitialStageRender} = props
  const scores = useFragment(
    graphql`
      fragment TeamHealthVotingRow_scores on TeamHealthUserScore @relay(plural: true) {
        user {
          ...AvatarList_users
        }
      }
    `,
    scoresRef
  )
  const label = undefined//'foo'
  const color = undefined//PALETTE.SLATE_800
  const users = scores.map(({user}) => user)
  return (
    <div className='flex items-center py-[5px] pl-4 rounded w-80 h-14 bg-slate-300'>
      <MiniCardWrapper>
        <MiniPokerCard>
          <CheckIcon className='text-jade-400'/>
        </MiniPokerCard>
      </MiniCardWrapper>
      <AvatarList
        size={PokerCards.AVATAR_WIDTH}
        users={users}
        isAnimated={!isInitialStageRender}
        borderColor={PALETTE.SLATE_300}
        emptyEl={<PokerVotingNoVotes />}
      />
    </div>
  )
}

export default PokerVotingRow
