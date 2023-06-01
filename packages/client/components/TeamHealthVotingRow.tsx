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
}

const TeamHealthVotingRow = (props: Props) => {
  const {stage: stageRef} = props
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
    <div className='flex h-14 w-80 shrink-0 items-center rounded bg-slate-300 pl-4'>
      <div className='mr-4'>
        <MiniPokerCard color={PALETTE.JADE_400}>
          <CheckIcon className='text-white' />
        </MiniPokerCard>
      </div>
      <AvatarList
        size={PokerCards.AVATAR_WIDTH}
        users={votedUsers}
        isAnimated={true}
        borderColor={PALETTE.SLATE_300}
        emptyEl={<PokerVotingNoVotes />}
      />
    </div>
  )
}

export default TeamHealthVotingRow
