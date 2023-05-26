import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '../styles/paletteV3'
import {PokerCards} from '../types/constEnums'
import {TeamHealthVotingRow_stage$key} from '../__generated__/TeamHealthVotingRow_stage.graphql'
import AvatarList from './AvatarList'
import {Check as CheckIcon} from '@mui/icons-material'
import MiniPokerCard from './MiniPokerCard'
import PokerVotingNoVotes from './PokerVotingNoVotes'

interface Props {
  stage: TeamHealthVotingRow_stage$key
  isInitialStageRender?: boolean
}

const MiniCardWrapper = styled('div')({
  // This adds the gutter between the mini card and the avatars
  marginRight: 16
})

const TeamHealthVotingRow = (props: Props) => {
  const {stage: stageRef, isInitialStageRender} = props
  const stage = useFragment(
    graphql`
      fragment TeamHealthVotingRow_stage on TeamHealthStage {
        votedUsers {
          ...AvatarList_users
        }
      }
    `,
    stageRef
  )
  const {votedUsers} = stage
  return (
    <div className='flex h-14 w-80 items-center rounded bg-slate-300 py-[5px] pl-4'>
      <MiniCardWrapper>
        <MiniPokerCard>
          <CheckIcon className='text-jade-400' />
        </MiniPokerCard>
      </MiniCardWrapper>
      <AvatarList
        size={PokerCards.AVATAR_WIDTH}
        users={votedUsers}
        isAnimated={!isInitialStageRender}
        borderColor={PALETTE.SLATE_300}
        emptyEl={<PokerVotingNoVotes />}
      />
    </div>
  )
}

export default TeamHealthVotingRow
