import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import styled from '@emotion/styled'
import {TransitionStatus} from '~/hooks/useTransition'
import PokerVotingAvatarBase from './PokerVotingAvatarBase'
import {createFragmentContainer} from 'react-relay'
import {PokerVotingAvatar_user} from '../__generated__/PokerVotingAvatar_user.graphql'
import {SetVotedUserEl} from './EstimatePhaseArea'

const Avatar = PokerVotingAvatarBase.withComponent('img')

const StyledAvatar = styled(Avatar)({
  position: 'relative'
})

interface Props {
  onTransitionEnd?: () => void
  setVotedUserEl: SetVotedUserEl
  status?: TransitionStatus
  user: PokerVotingAvatar_user
}

const PokerVotingAvatar = (props: Props) => {
  const {setVotedUserEl, user} = props
  const {picture, id: userId} = user
  return (
    <StyledAvatar
      ref={(el) => setVotedUserEl(userId, el)}
      src={picture}
    />
  )
}

export default createFragmentContainer(
  PokerVotingAvatar,
  {
    user: graphql`
      fragment PokerVotingAvatar_user on User{
        id
        picture
      }`
  }
)
