import React from 'react'
import styled from '@emotion/styled'
import {TransitionStatus} from '~/hooks/useTransition'
import PokerVotingAvatarBase from './PokerVotingAvatarBase'

const Avatar = PokerVotingAvatarBase.withComponent('img')

const StyledAvatar = styled(Avatar)({
  position: 'relative'
})

interface Voter {
  picture: string
  userId: string
}

interface Props {
  className?: string
  onTransitionEnd?: () => void
  setVotedUserEl: (userId: string, el: HTMLDivElement) => void
  status?: TransitionStatus
  voter: Voter
}

const PokerVotingAvatar = (props: Props) => {
  const {setVotedUserEl, className, voter} = props
  const {picture, userId} = voter
  return (
    <StyledAvatar
      className={className}
      ref={(el: HTMLImageElement) => setVotedUserEl(userId, el)}
      src={picture}
    />
  )
}

export default PokerVotingAvatar
