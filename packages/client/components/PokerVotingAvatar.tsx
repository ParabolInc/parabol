import React, {useRef} from 'react'
import {TransitionStatus} from '~/hooks/useTransition'
import PokerVotingAvatarBase from './PokerVotingAvatarBase'

const Avatar = PokerVotingAvatarBase.withComponent('img')

interface Props {
  className?: string
  onTransitionEnd?: () => void
  picture: string
  status?: TransitionStatus
}

const PokerVotingAvatar = (props: Props) => {
  const {className, picture} = props
  const ref = useRef<HTMLImageElement>(null)
  // const x = ref!.current?.getBoundingClientRect().x ?? null
  // const y = ref!.current?.getBoundingClientRect().y ?? null
  return (
    <Avatar className={className} ref={ref as any} src={picture} />
  )
}

export default PokerVotingAvatar
