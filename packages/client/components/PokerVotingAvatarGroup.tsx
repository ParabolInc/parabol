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
  // overflow: 'auto',
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

  // Todo: Animate avatars into revealed rows from the pre-revealed row
  //       - Compare the y coordinate and the index of
  //       the pre-revealed row of voters with the revealed row of voters
  //       - Transition the x position of the avatar from the difference in index * avatar width
  //       - Transition the y position from the difference in the pre-revealed and revealed row

  // Todo: Animate avatar from one revealed row to another when they change votes during discussion state
  //       - Compare scores with previous scores
  //       - Compare template scale value index e.g. [1, 2, 3] and person changed from 1 to 3
  //       - Compare index of voters per scale value e.g. person was 3rd on previous row, now 2nd on new row
  //       - Transition y position based on scale value index change * fixed row height
  //       - Transition x position based on avatar index change * fixed avatar width
  //
  //       How do know the change in layout should be for a change in vote
  //       and not a change from voting view to discussion view?
  //
  //       Alternatively: we could just animated the initial change from voting to discussing.
  //       Avatars that change during discussion transition in or out like connected meeting avatars

  // Todo: Animate avatars if they’ve voted but are hoving cards
  //       - Listen for hovering avatars
  //       - Apply a transition that includes a wiggling effect

  // Todo: For the row of pass cards including folks who didn’t vote
  //       The avatars for those who didn’t vote transition in like connected meeting avatars

  return (
    <Wrapper ref={rowRef}>
      {visibleVoters.map((voter, idx) => (
        <PokerVotingAvatar idx={idx} key={idx} picture={voter.picture} />
      ))}
      {overflowCount > 0
        ? <CountBadge count={adjustedCount}>{'+'}{adjustedCount}</CountBadge>
        : null
      }
    </Wrapper >
  )
}

export default PokerVotingAvatarGroup
