import graphql from 'babel-plugin-relay/macro'
import {AnimatePresence} from 'motion/react'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {DeckActivityAvatars_stage$key} from '../__generated__/DeckActivityAvatars_stage.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {PokerCards} from '../types/constEnums'
import AvatarListUser from './AvatarListUser'

interface Props {
  stage: DeckActivityAvatars_stage$key
}

const MAX_PEEKERS = 5
const DeckActivityAvatars = (props: Props) => {
  const {stage: stageRef} = props
  const stage = useFragment(
    graphql`
      fragment DeckActivityAvatars_stage on EstimateStage {
        id
        hoveringUsers {
          ...AvatarListUser_user
          id
          picture
        }
        scores {
          userId
        }
      }
    `,
    stageRef
  )
  const {hoveringUsers, scores} = stage
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  // FIXME: DEBUG ONLY!!!
  // useMockPeekers(stageId)
  const peekingUsers = useMemo(() => {
    const scoredUserIds = new Set(scores.map(({userId}) => userId))
    return hoveringUsers
      .filter((user) => {
        if (viewerId === user.id) return false
        return !scoredUserIds.has(user.id)
      })
      .slice(0, MAX_PEEKERS)
      .map((user) => ({
        ...user,
        key: user.id
      }))
  }, [scores, hoveringUsers])
  return (
    <div className='pointer-events-none absolute top-8 right-0 z-100 h-full w-16'>
      <AnimatePresence initial={false}>
        {peekingUsers.map((user, idx) => (
          <AvatarListUser
            key={user.id}
            user={user}
            offset={(PokerCards.AVATAR_WIDTH - 10) * idx}
            isColumn
            className='h-11.5 w-11.5 border border-surface-well'
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default DeckActivityAvatars
