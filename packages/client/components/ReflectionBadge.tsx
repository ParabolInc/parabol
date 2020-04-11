import * as React from 'react'
import styled from '@emotion/styled'
import {IUser} from '../types/graphql'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'
import Avatar from './Avatar/Avatar'

interface ReflectionBadgeProps {
  toggleAnonymity: () => void
  isAnonymous: boolean
  isViewerCreator: boolean
  createdBy?: Pick<IUser, 'preferredName' | 'picture' | 'id'>
  /* */
}

const BadgeWrapper = styled('div')<{open: boolean}>(({open}) => ({
  padding: '0px 16px',
  height: open ? '22px' : '0px',
  overflow: 'hidden',
  transition: '0.2s'
}))

const InnerBase = styled('div')<{active: boolean; isAnonymous: boolean}>(
  ({active, isAnonymous}) => ({
    cursor: active ? 'pointer' : 'default',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    color: isAnonymous ? 'rgb(130, 128, 154)' : 'inherit'
  })
)

const NameWrapper = styled('div')({
  fontSize: '12px',
  marginLeft: '5px'
})

const noop = () => undefined

const ReflectionBadge = ({
  isViewerCreator,
  isAnonymous,
  createdBy,
  toggleAnonymity
}: ReflectionBadgeProps) => {
  const renderInner = () => {
    // If the reflection is anonymous and does not belong to the viewer, show nothing
    if (isAnonymous && !isViewerCreator) return null
    // If createdBy is not supplied return null. This should never happen in practice,
    // but this line acts as a typeguard
    if (!createdBy) return null

    const clickHandler = isViewerCreator ? toggleAnonymity : noop
    const ariaLabel = isViewerCreator ? 'Click to toggle anonymity' : undefined
    const avatarImage = isAnonymous ? anonymousAvatar : createdBy.picture
    const Inner = isViewerCreator ? InnerBase.withComponent('div') : InnerBase
    const name = isAnonymous ? 'Submit anonymously' : createdBy.preferredName

    if (isViewerCreator && createdBy) {
      return (
        <Inner
          active={isViewerCreator}
          isAnonymous={isAnonymous}
          aria-label={ariaLabel}
          onClick={clickHandler}
        >
          <Avatar picture={avatarImage} size={15} />
          <NameWrapper>{name}</NameWrapper>
        </Inner>
      )
    }
    return null
  }

  const isOpen = isViewerCreator || (!isViewerCreator && !isAnonymous)

  return <BadgeWrapper open={isOpen}>{renderInner()}</BadgeWrapper>
}

export default ReflectionBadge
