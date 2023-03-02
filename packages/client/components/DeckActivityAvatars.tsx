import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useTransition, {TransitionStatus} from '../hooks/useTransition'
import {PokerCards} from '../types/constEnums'
import {DeckActivityAvatars_stage$key} from '../__generated__/DeckActivityAvatars_stage.graphql'
import AvatarListUser from './AvatarListUser'

const DeckActivityPanel = styled('div')({
  height: '100%',
  position: 'absolute',
  // let things underneath this be clickable
  pointerEvents: 'none',
  right: 0,
  top: 32, // stay below the header
  width: 64,
  zIndex: 100 // show above dimension column
})

const PeekingAvatar = styled(AvatarListUser)<{status?: TransitionStatus}>(({status}) => ({
  opacity: status === TransitionStatus.EXITING ? 0 : 1,
  transform:
    status === TransitionStatus.MOUNTED
      ? `translate(64px)`
      : status === TransitionStatus.EXITING
      ? 'scale(0)'
      : undefined
}))

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
  const transitionChildren = useTransition(peekingUsers)
  return (
    <DeckActivityPanel>
      {transitionChildren.map(({child, onTransitionEnd, status}, idx) => {
        const {id: userId} = child
        const visibleScoreIdx = peekingUsers.findIndex((user) => user.id === userId)
        const displayIdx = visibleScoreIdx === -1 ? idx : visibleScoreIdx
        return (
          <PeekingAvatar
            key={userId}
            status={status}
            onTransitionEnd={onTransitionEnd}
            user={child}
            offset={(PokerCards.AVATAR_WIDTH - 10) * displayIdx}
            isColumn
            isAnimated
            width={PokerCards.AVATAR_WIDTH as number}
          />
        )
      })}
    </DeckActivityPanel>
  )
}

export default DeckActivityAvatars
