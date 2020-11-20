import React, {useRef} from 'react'
import styled from '@emotion/styled'
import PokerVotingAvatar from './PokerVotingAvatar'
import PokerVotingAvatarOverflowCount from './PokerVotingAvatarOverflowCount'
import usePokerAvatarOverflow from '~/hooks/userPokerAvatarOverflow'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {PokerVotingAvatarGroup_scores} from '../__generated__/PokerVotingAvatarGroup_scores.graphql'
import {SetVotedUserEl} from './EstimatePhaseArea'

const Wrapper = styled('div')({
  display: 'flex',
  flex: 1,
  flexShrink: 0,
  marginLeft: 14, // 16px is 2x grid but accounts for 2px invisible overlapping border
  maxWidth: '100%',
  minWidth: 54,
  paddingLeft: 10 // accounts for avatar overlap and overflow
})

const CountBadge = styled(PokerVotingAvatarOverflowCount)<{count: number}>(({count}) => ({
  fontSize: count >= 10 ? 12 : 14
}))

interface Props {
  setVotedUserEl: SetVotedUserEl
  scores: PokerVotingAvatarGroup_scores
}

const PokerVotingAvatarGroup = (props: Props) => {
  const {scores, setVotedUserEl} = props

  {/*
      TBD Tapping the avatar group when there’s overflow raises a
      dialog with a read-only list of all teammates showing who hasn’t voted first?
  */}
  const rowRef = useRef<HTMLDivElement>(null)
  const maxAvatars = usePokerAvatarOverflow(rowRef) // max is 5, scores is 6
  const overflowCount = scores.length > maxAvatars ? scores.length - maxAvatars - 1 : 0
  const visibleScores = overflowCount === 0 ? scores : scores.slice(0, maxAvatars - 1)

  // Todo: Avatars and overflow badge transition in and out
  //       See `NewMeetingAvatarGroup.tsx` and use a similar approach

  // Todo: Animate avatars into revealed rows from the pre-revealed row
  //       Floating avatars animate to preview row avatars or revealed row avatars
  //       based on refs that are set by preview/revealed avatars and used by the floating avatars
  //       See useDraggableReflectionCard.tsx to check every frame via requestAnimationFrame
  //       in case the peeking avatar is in flight and the stage changes from isVoting to discussion

  // Todo: Transition avatars with change in votes during discussion
  //       Avatars that change during discussion transition in or out like connected meeting avatars

  // Todo: Animate avatars if they’ve voted but are hoving cards
  //       - Listen for hovering avatars
  //       - Apply a transition that includes a wiggling effect

  // Todo: For the row of pass cards including folks who didn’t vote
  //       The avatars for those who didn’t vote transition in like connected meeting avatars
  return (
    <Wrapper ref={rowRef}>
      {visibleScores.map((score) => {
        const {user} = score
        const {id: userId} = user
        return (
          <PokerVotingAvatar key={userId} setVotedUserEl={setVotedUserEl} user={user} />
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
        user {
          ...PokerVotingAvatar_user
          id
        }
      }`
  }
)
