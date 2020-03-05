import React from 'react'
import defaultUserAvatar from '../styles/theme/images/avatar-user.svg'
import styled from '@emotion/styled'
import Avatar from './Avatar/Avatar'

const AvatarCol = styled('div')({
  display: 'flex'
})

const ColumnAvatar = styled(Avatar)({
  margin: 12,
  marginTop: 0
})

interface Props {
  picture: string | null
}

const ThreadedAvatarColumn = (props: Props) => {
  const {picture} = props
  return (
    <AvatarCol>
      <ColumnAvatar size={32} picture={picture || defaultUserAvatar} />
    </AvatarCol>
  )
}

export default ThreadedAvatarColumn
