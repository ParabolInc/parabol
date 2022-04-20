import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactElement, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import useOverflowAvatars from '../hooks/useOverflowAvatars'
import {TransitionStatus} from '../hooks/useTransition'
import {BezierCurve} from '../types/constEnums'
import {AvatarList_users} from '../__generated__/AvatarList_users.graphql'
import AvatarListUser from './AvatarListUser'
import OverflowAvatar from './OverflowAvatar'

const Wrapper = styled('div')<{minHeight: number; size: number}>(({minHeight, size}) => ({
  alignItems: 'center',
  display: 'flex',
  // This left margin accounts for the border on the avatar
  // giving us tighter vertical alignment on the left edge
  marginLeft: size >= 40 ? -3 : -2,
  position: 'relative',
  width: '100%',
  transition: `min-height 100ms ${BezierCurve.DECELERATE}`,
  minHeight
}))

const widthToOverlap = {
  28: 8,
  46: 16
}

// hard coding for now until we have
// a better solution for handling gutters
// for a component that may not be there
export const sizeToHeightBump = {
  28: 4,
  46: 0
} as const

interface Props {
  users: AvatarList_users
  onUserClick?: (userId: string) => void
  onOverflowClick?: () => void
  size: 28 | 46
  emptyEl?: ReactElement
  isAnimated?: boolean
  borderColor?: string
}

const AvatarList = (props: Props) => {
  const {users, onUserClick, onOverflowClick, size, emptyEl, isAnimated, borderColor} = props
  const rowRef = useRef<HTMLDivElement>(null)
  const overlap = widthToOverlap[size]
  const offsetSize = size - overlap
  const transitionChildren = useOverflowAvatars(rowRef, users, size, overlap)
  const showAnimated = isAnimated ?? true
  const activeTChildren = transitionChildren.filter(
    (child) => child.status !== TransitionStatus.EXITING
  )
  const minHeight = activeTChildren.length === 0 ? 0 : size + sizeToHeightBump[size]
  return (
    <Wrapper ref={rowRef} minHeight={minHeight} size={size}>
      {transitionChildren.length === 0 && emptyEl}
      {transitionChildren.map(({onTransitionEnd, child, status, displayIdx}) => {
        const {id: userId} = child
        if ('overflowCount' in child) {
          const {overflowCount} = child
          return (
            <OverflowAvatar
              key={userId}
              isAnimated={showAnimated}
              onTransitionEnd={onTransitionEnd}
              status={status}
              offset={offsetSize * displayIdx}
              overflowCount={overflowCount}
              onClick={onOverflowClick}
              width={size}
              borderColor={borderColor}
            />
          )
        }
        return (
          <AvatarListUser
            key={userId}
            isAnimated={showAnimated}
            user={child}
            onClick={onUserClick ? () => onUserClick(userId) : undefined}
            onTransitionEnd={onTransitionEnd}
            status={status}
            offset={offsetSize * displayIdx}
            width={size}
            borderColor={borderColor}
          />
        )
      })}
    </Wrapper>
  )
}

export default createFragmentContainer(AvatarList, {
  users: graphql`
    fragment AvatarList_users on User @relay(plural: true) {
      id
      ...AvatarListUser_user
    }
  `
})
