import React, {useRef} from 'react'
import styled from '@emotion/styled'
import {TransitionStatus} from '~/hooks/useTransition'
import PokerVotingAvatarBase from './PokerVotingAvatarBase'

const Avatar = PokerVotingAvatarBase.withComponent('img')

const StyledAvatar = styled(Avatar)<{idx?: number}>(({idx}) => ({
  position: 'relative',
  top: idx ? `${idx * 0}px` : '0px'
}))

interface Props {
  className?: string
  idx?: number,
  onTransitionEnd?: () => void
  picture: string
  status?: TransitionStatus
}

const PokerVotingAvatar = (props: Props) => {
  const {className, idx, picture} = props
  const ref = useRef<HTMLImageElement>(null)
  // const x = ref!.current?.getBoundingClientRect().x ?? null
  // const y = ref!.current?.getBoundingClientRect().y ?? null
  return (
    <StyledAvatar
      className={className}
      idx={idx}
      ref={ref as any}
      src={picture}
      style={{}}
    />
  )
}

export default PokerVotingAvatar
