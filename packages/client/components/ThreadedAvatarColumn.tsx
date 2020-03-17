import styled from '@emotion/styled'
import React from 'react'
import defaultUserAvatar from '../styles/theme/images/avatar-user.svg'
import Avatar from './Avatar/Avatar'

const AvatarCol = styled('div')<{isReply: boolean | undefined}>(({isReply}) => ({
  display: 'flex',
  paddingRight: 8,
  paddingLeft: isReply ? undefined : 8
}))

const ColumnAvatar = styled(Avatar)({})

interface Props {
  isReply: boolean | undefined
  picture: string | null
}

const ThreadedAvatarColumn = (props: Props) => {
  const {picture, isReply} = props
  return (
    <AvatarCol isReply={isReply}>
      <ColumnAvatar size={32} picture={picture || defaultUserAvatar} />
    </AvatarCol>
  )
}

export default ThreadedAvatarColumn
