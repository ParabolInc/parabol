import React from 'react'
import styled from '@emotion/styled'
import PokerVotingAvatar from './PokerVotingAvatar'
import PokerVotingAvatarOverflowCount from './PokerVotingAvatarOverflowCount'

const Wrapper = styled('div')({
  display: 'flex',
  flex: 1,
  flexShrink: 0,
  marginLeft: 14, // 16px is 2x grid but accounts for 2px invisible overlapping border
  maxWidth: '100%',
  overflow: 'auto',
  paddingLeft: 10 // accounts for avatar overlap and overflow
})

interface Props {
  voters: Array<any>
}

const PokerVotingAvatarGroup = (props: Props) => {
  const {voters} = props
  const showOverflow = true

  {/*
      WIP Responsive container and number of avatars before overflow count

      This depends on the breakpoint, it’d be nice to have 2:
      - Mobile: show 7 avatars or 6 plus count
      - Laptop+: show 12 avatars or 11 plus count

      We need to make sure the columns are fixed at 2 breakpoints instead of adaptive
      See NewMeetingAvatarGroup for how it handles the overflow count

      TBD Tapping the avatar group when there’s overflow raises a
      dialog with a read-only list of all teammates showing who hasn’t voted first?
  */}

  return (
    <Wrapper>
      {voters.map((voter, idx) => (
        <PokerVotingAvatar key={idx} picture={voter.picture} />
      ))}
      {showOverflow ? <PokerVotingAvatarOverflowCount>{'+2'}</PokerVotingAvatarOverflowCount> : null}
    </Wrapper>
  )
}

export default PokerVotingAvatarGroup
