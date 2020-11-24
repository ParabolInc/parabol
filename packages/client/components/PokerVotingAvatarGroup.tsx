import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import usePokerAvatarOverflow from '~/hooks/userPokerAvatarOverflow'
import useTransition from '../hooks/useTransition'
import {PALETTE} from '../styles/paletteV2'
import {PokerVotingAvatarGroup_scores} from '../__generated__/PokerVotingAvatarGroup_scores.graphql'
import PokerVotingAvatar from './PokerVotingAvatar'
import PokerVotingAvatarOverflowCount from './PokerVotingAvatarOverflowCount'

const NoVotesHeaderLabel = styled('div')({
  color: PALETTE.TEXT_GRAY,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '24px',
  paddingLeft: 16
})

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  position: 'relative',
  marginLeft: 8,
  width: '100%',
  height: '100%'
})

const CountBadge = styled(PokerVotingAvatarOverflowCount)<{count: number}>(({count}) => ({
  fontSize: count >= 10 ? 12 : 14
}))

interface Props {
  scores: PokerVotingAvatarGroup_scores
}

const PokerVotingAvatarGroup = (props: Props) => {
  const {scores} = props

  {/*
      TBD Tapping the avatar group when there’s overflow raises a
      dialog with a read-only list of all teammates showing who hasn’t voted first?
  */}
  const rowRef = useRef<HTMLDivElement>(null)
  const maxAvatars = usePokerAvatarOverflow(rowRef) // max is 5, scores is 6
  const overflowCount = scores.length > maxAvatars ? scores.length - maxAvatars - 1 : 0
  const visibleScores = overflowCount === 0 ? scores : scores.slice(0, maxAvatars - 1)
  const transitionChildren = useTransition(visibleScores.map((score => ({...score, key: score.id}))))
  return (
    <Wrapper ref={rowRef}>
      {transitionChildren.length === 0 && <NoVotesHeaderLabel>{'No Votes'}</NoVotesHeaderLabel>}
      {transitionChildren.map(({onTransitionEnd, child, status}, idx) => {
        const {user, id: childId} = child
        const visibleScoreIdx = visibleScores.findIndex((score) => score.id === child.id)
        const displayIdx = visibleScoreIdx === -1 ? idx : visibleScoreIdx
        return (
          <PokerVotingAvatar key={childId} user={user} onTransitionEnd={onTransitionEnd} status={status} idx={displayIdx} />
        )
      })}
      {overflowCount > 0 && <CountBadge count={overflowCount}>{'+'}{overflowCount}</CountBadge>}
    </Wrapper >
  )
}

export default createFragmentContainer(
  PokerVotingAvatarGroup,
  {
    scores: graphql`
      fragment PokerVotingAvatarGroup_scores on EstimateUserScore @relay(plural: true) {
        id
        user {
          ...PokerVotingAvatar_user
        }
      }`
  }
)
