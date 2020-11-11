import React, {useRef} from 'react'
import styled from '@emotion/styled'
import PokerVotingAvatar from './PokerVotingAvatar'
import PokerVotingAvatarOverflowCount from './PokerVotingAvatarOverflowCount'
import usePokerAvatarOverflow from '~/hooks/userPokerAvatarOverflow'

const Wrapper = styled('div')({
  display: 'flex',
  flex: 1,
  flexShrink: 0,
  marginLeft: 14, // 16px is 2x grid but accounts for 2px invisible overlapping border
  maxWidth: '100%',
  minWidth: 54,
  overflow: 'auto',
  paddingLeft: 10 // accounts for avatar overlap and overflow
})

const CountBadge = styled(PokerVotingAvatarOverflowCount)<{count: number}>(({count}) => ({
  fontSize: count >= 10 ? 12 : 14
}))

interface Props {
  voters: Array<any>
}

const PokerVotingAvatarGroup = (props: Props) => {
  {/*
      TBD Tapping the avatar group when there’s overflow raises a
      dialog with a read-only list of all teammates showing who hasn’t voted first?
  */}
  const {voters} = props
  const rowRef = useRef<HTMLDivElement>(null)
  const overflowCount = usePokerAvatarOverflow(rowRef, voters.length)
  // Adjust for the overflow badge taking an extra avatar spot
  const adjustedCount = overflowCount + 1
  const overflowThreshold = voters.length - adjustedCount
  const visibleVoters = overflowCount === voters.length
    ? []
    : overflowCount === 0
      ? voters
      : voters.slice(0, overflowThreshold)

  // Todo: Avatars and overflow badge transition in and out
  //       See `NewMeetingAvatarGroup.tsx` and use a similar approach

  // Todo: Animate avatars into their place in the row
  //       - Compare the y coordinate and the index of
  //       the pre-revealed row of voters with the revealed row of voters
  //       - Transition the x position of the avatar from the difference in index * avatar width
  //       - Transition the y position from the difference in the pre-revealed and revealed row

  return (
    <Wrapper ref={rowRef}>
      {visibleVoters.map((voter, idx) => (
        <PokerVotingAvatar key={idx} picture={voter.picture} />
      ))}
      {overflowCount > 0
        ? <CountBadge count={adjustedCount}>{'+'}{adjustedCount}</CountBadge>
        : null
      }
    </Wrapper >
  )
}

export default PokerVotingAvatarGroup
