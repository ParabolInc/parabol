import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {TransitionStatus} from '../hooks/useTransition'
import {BezierCurve} from '../types/constEnums'
import {PeekingAvatar_user} from '../__generated__/PeekingAvatar_user.graphql'
import Avatar from './Avatar/Avatar'

const Wrapper = styled('div')<{status: TransitionStatus, voteOffsets: [number?, number?]}>(({voteOffsets, status}) => ({
  height: status === TransitionStatus.EXITING || status === TransitionStatus.MOUNTED ? 0 : 48,
  transform: status === TransitionStatus.EXITING ? voteOffsets.length ? `translate(${voteOffsets[0]}px,${voteOffsets[1]}px)` : `translateX(64px)` : status === TransitionStatus.MOUNTED ? `translate(64px)` : undefined,
  transition: `all 300ms ${BezierCurve.DECELERATE}`
}))

interface Props {
  hasVoted: boolean
  getVotedUserEl: (userId: string) => HTMLDivElement
  status: TransitionStatus
  onTransitionEnd: () => void
  user: PeekingAvatar_user
}

const PeekingAvatar = (props: Props) => {
  const {hasVoted, getVotedUserEl, status, onTransitionEnd, user} = props
  const {id: userId, picture} = user
  const ref = useRef<HTMLDivElement>(null)
  let voteOffsets = [] as [number?, number?]
  if (status === TransitionStatus.EXITING && hasVoted) {
    const el = getVotedUserEl(userId)
    const bbox = el.getBoundingClientRect()
    const {left: targetX, top: targetY} = bbox
    const wrapperBBox = ref.current?.getBoundingClientRect()
    if (wrapperBBox) {
      const {left, top} = wrapperBBox
      const dX = left - targetX
      const dY = top - targetY
      voteOffsets = [dX, dY]
    }
  }
  return (
    <Wrapper ref={ref} status={status} voteOffsets={voteOffsets} onTransitionEnd={onTransitionEnd}>
      <Avatar picture={picture} size={40} />
    </Wrapper>
  )
}

export default createFragmentContainer(
  PeekingAvatar,
  {
    user: graphql`
    fragment PeekingAvatar_user on User {
      id
      picture
    }`
  }
)
