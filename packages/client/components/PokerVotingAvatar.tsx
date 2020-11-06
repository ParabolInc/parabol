import React from 'react'
import PokerVotingAvatarBase from './PokerVotingAvatarBase'

const Avatar = PokerVotingAvatarBase.withComponent('img')

interface Props {
  className?: string
  picture: string
}

const PokerVotingAvatar = (props: Props) =>
  <Avatar className={props.className} src={props.picture} />

export default PokerVotingAvatar
