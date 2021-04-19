import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactElement, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import useOverflowAvatars from '../hooks/useOverflowAvatars'
import {AvatarList_users} from '../__generated__/AvatarList_users.graphql'
import AvatarListUser from './AvatarListUser'
import OverflowAvatar from './OverflowAvatar'

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  position: 'relative',
  width: '100%',
  height: 32
})

const widthToOverlap = {
  24: 10,
  46: 10
}

interface Props {
  users: AvatarList_users
  onUserClick?: (userId: string) => void
  onOverflowClick?: () => void
  className?: string
  size: 24 | 46
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
  return (
    <Wrapper ref={rowRef}>
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
