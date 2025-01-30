import {Check as CheckIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {TeamHealthVotingRow_stage$key} from '../__generated__/TeamHealthVotingRow_stage.graphql'
import {PALETTE} from '../styles/paletteV3'
import {PokerCards} from '../types/constEnums'
import AvatarList from './AvatarList'
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
        viewerVote
        votedUsers {
          ...AvatarList_users
          id
        }
      }
    `,
    stageRef
  )
  const {viewerVote, votedUsers} = stage
  return (
    <div className='flex h-14 w-80 shrink-0 items-center rounded-sm bg-slate-300 pl-2'>
      <div className='mr-4'>
        <MiniPokerCard color={!!viewerVote ? PALETTE.JADE_400 : undefined}>
          <CheckIcon className={!!viewerVote ? 'text-white' : 'text-jade-400'} />
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
