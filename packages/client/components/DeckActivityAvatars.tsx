import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useTransition from '../hooks/useTransition'
import {DeckActivityAvatars_stage} from '../__generated__/DeckActivityAvatars_stage.graphql'
import {GetVotedUserEl} from './EstimatePhaseArea'
import PeekingAvatar from './PeekingAvatar'


const DeckActivityPanel = styled('div')({
  // background: 'blue',
  height: '100%',
  position: 'absolute',
  right: 0,
  width: 64
})

interface Props {
  stage: DeckActivityAvatars_stage
  getVotedUserEl: GetVotedUserEl
}

const MAX_PEEKERS = 5
const DeckActivityAvatars = (props: Props) => {
  const {getVotedUserEl, stage} = props
  const {hoveringUsers, scores} = stage
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const scoredUserIds = new Set(scores.map(({userId}) => userId))
  const peekingUsers = useMemo(() => {
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
      {transitionChildren.map(({child, onTransitionEnd, status}) => {
        const hasVoted = scoredUserIds.has(child.id)
        return (
          <PeekingAvatar hasVoted={hasVoted} status={status} onTransitionEnd={onTransitionEnd} key={child.key} user={child} getVotedUserEl={getVotedUserEl} />
        )
      })}
    </DeckActivityPanel>
  )
}

export default createFragmentContainer(
  DeckActivityAvatars,
  {
    stage: graphql`
    fragment DeckActivityAvatars_stage on EstimateStage {
      hoveringUsers {
        ...PeekingAvatar_user
        id
        picture
      }
      scores {
        userId
      }
    }`
  }
)
