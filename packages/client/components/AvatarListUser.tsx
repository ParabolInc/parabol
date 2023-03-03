import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {TransitionStatus} from '~/hooks/useTransition'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import {BezierCurve} from '../types/constEnums'
import {AvatarListUser_user$key} from '../__generated__/AvatarListUser_user.graphql'
import Avatar from './Avatar/Avatar'

const Wrapper = styled('div')<{offset: number; isColumn?: boolean}>(({offset, isColumn}) => ({
  position: 'absolute',
  transform: `translate${isColumn ? 'Y' : 'X'}(${offset}px)`,
  transition: `all 300ms ${BezierCurve.DECELERATE}`
}))

const StyledAvatar = styled(Avatar)<{
  status?: TransitionStatus
  isAnimated: boolean
  borderColor?: string
  width: number
}>(({status, isAnimated, borderColor = '#fff', width}) => ({
  border: `${width >= 40 ? '3px' : '2px'} solid ${borderColor}`,
  opacity: !isAnimated
    ? undefined
    : status === TransitionStatus.EXITING || status === TransitionStatus.MOUNTED
    ? 0
    : 1,
  transform: !isAnimated
    ? undefined
    : status === TransitionStatus.EXITING || status === TransitionStatus.MOUNTED
    ? 'scale(0)'
    : 'scale(1)',
  transition: `all 300ms ${BezierCurve.DECELERATE}`
}))

interface Props {
  className?: string
  offset: number
  isColumn?: boolean
  isAnimated: boolean
  onTransitionEnd?: () => void
  status?: TransitionStatus
  user: AvatarListUser_user$key
  width: number
  onClick?: () => void
  borderColor?: string
}

const AvatarListUser = (props: Props) => {
  const {
    className,
    isColumn,
    user: userRef,
    onTransitionEnd,
    status,
    offset,
    isAnimated,
    width,
    onClick,
    borderColor
  } = props
  const user = useFragment(
    graphql`
      fragment AvatarListUser_user on User {
        picture
        preferredName
      }
    `,
    userRef
  )
  const {picture, preferredName} = user
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )
  return (
    <Wrapper
      ref={originRef}
      offset={offset}
      isColumn={isColumn}
      onClick={onClick}
      onMouseOver={openTooltip}
      onMouseLeave={closeTooltip}
    >
      <StyledAvatar
        className={className}
        status={status}
        onTransitionEnd={onTransitionEnd}
        picture={picture}
        size={width}
        isAnimated={isAnimated}
        borderColor={borderColor}
        width={width}
      />
      {tooltipPortal(preferredName)}
    </Wrapper>
  )
}

export default AvatarListUser
