import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import {useFragment} from 'react-relay'
import {TransitionStatus} from '~/hooks/useTransition'
import {AvatarListUser_user$key} from '../__generated__/AvatarListUser_user.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import {BezierCurve} from '../types/constEnums'
import Avatar from './Avatar/Avatar'

const Wrapper = styled('div')<{offset: number; isColumn?: boolean}>(({offset, isColumn}) => ({
  position: 'absolute',
  transform: `translate${isColumn ? 'Y' : 'X'}(${offset}px)`,
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
  const isAnimating =
    isAnimated && (status === TransitionStatus.EXITING || status === TransitionStatus.MOUNTED)

  return (
    <Wrapper
      ref={originRef}
      offset={offset}
      isColumn={isColumn}
      onClick={onClick}
      onMouseOver={openTooltip}
      onMouseLeave={closeTooltip}
    >
      <Avatar
        className={clsx(
          `border-solid border-[${borderColor || '#fff'}] duration-300 ease-out ${isAnimating ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`,
          className
        )}
        onTransitionEnd={onTransitionEnd}
        picture={picture}
      />
      {tooltipPortal(preferredName)}
    </Wrapper>
  )
}

export default AvatarListUser
