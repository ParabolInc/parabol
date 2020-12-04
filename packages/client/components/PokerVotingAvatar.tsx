import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {TransitionStatus} from '~/hooks/useTransition'
import {PALETTE} from '../styles/paletteV2'
import {BezierCurve} from '../types/constEnums'
import {PokerVotingAvatar_user} from '../__generated__/PokerVotingAvatar_user.graphql'
import Avatar from './Avatar/Avatar'

const Wrapper = styled('div')<{idx: number, isColumn?: boolean}>(({idx, isColumn}) => ({
  position: 'absolute',
  transform: `translate${isColumn ? 'Y' : 'X'}(${idx * 30}px)`,
  transition: `all 300ms ${BezierCurve.DECELERATE}`
}))

const StyledAvatar = styled(Avatar)<{status?: TransitionStatus}>(({status}) => ({
  opacity: status === TransitionStatus.EXITING || status === TransitionStatus.MOUNTED ? 0 : 1,
  border: `2px solid ${PALETTE.BORDER_MATCH_MEETING_COLUMN}`,
  transform: status === TransitionStatus.EXITING || status === TransitionStatus.MOUNTED ? 'scale(0)' : 'scale(1)',
  transition: `all 300ms ${BezierCurve.DECELERATE}`
}))

interface Props {
  className?: string
  idx: number
  isColumn?: boolean
  onTransitionEnd?: () => void
  status?: TransitionStatus
  user: PokerVotingAvatar_user
}

const PokerVotingAvatar = (props: Props) => {
  const {className, isColumn, user, onTransitionEnd, status, idx} = props
  const {picture} = user
  return (
    <Wrapper idx={idx} isColumn={isColumn}>
      <StyledAvatar
        className={className}
        status={status}
        onTransitionEnd={onTransitionEnd}
        picture={picture}
        size={40}
      />
    </Wrapper>
  )
}

export default createFragmentContainer(
  PokerVotingAvatar,
  {
    user: graphql`
      fragment PokerVotingAvatar_user on User{
        picture
      }`
  }
)
