import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {TransitionStatus} from '~/hooks/useTransition'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import {PALETTE} from '../styles/paletteV3'
import {BezierCurve, PokerCards} from '../types/constEnums'
import {PokerVotingAvatar_user} from '../__generated__/PokerVotingAvatar_user.graphql'
import Avatar from './Avatar/Avatar'

const Wrapper = styled('div')<{idx: number; isColumn?: boolean}>(({idx, isColumn}) => ({
  position: 'absolute',
  transform: `translate${isColumn ? 'Y' : 'X'}(${idx * 30}px)`,
  transition: `all 300ms ${BezierCurve.DECELERATE}`
}))

const StyledAvatar = styled(Avatar)<{status?: TransitionStatus; isInitialStageRender: boolean}>(
  ({status, isInitialStageRender}) => ({
    opacity: isInitialStageRender
      ? undefined
      : status === TransitionStatus.EXITING || status === TransitionStatus.MOUNTED
      ? 0
      : 1,
    border: `${PokerCards.AVATAR_BORDER}px solid ${PALETTE.SLATE_300}`,
    transform: isInitialStageRender
      ? undefined
      : status === TransitionStatus.EXITING || status === TransitionStatus.MOUNTED
      ? 'scale(0)'
      : 'scale(1)',
    transition: `all 300ms ${BezierCurve.DECELERATE}`
  })
)

interface Props {
  className?: string
  idx: number
  isColumn?: boolean
  isInitialStageRender: boolean
  onTransitionEnd?: () => void
  status?: TransitionStatus
  user: PokerVotingAvatar_user
}

const PokerVotingAvatar = (props: Props) => {
  const {className, isColumn, user, onTransitionEnd, status, idx, isInitialStageRender} = props
  const {picture, preferredName} = user
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER
  )
  return (
    <Wrapper idx={idx} isColumn={isColumn} onMouseEnter={openTooltip} onMouseLeave={closeTooltip}>
      <StyledAvatar
        className={className}
        status={status}
        ref={originRef}
        onTransitionEnd={onTransitionEnd}
        picture={picture}
        size={PokerCards.AVATAR_WIDTH as number}
        isInitialStageRender={isInitialStageRender}
      />
      {tooltipPortal(preferredName)}
    </Wrapper>
  )
}

export default createFragmentContainer(PokerVotingAvatar, {
  user: graphql`
    fragment PokerVotingAvatar_user on User {
      preferredName
      picture
    }
  `
})
