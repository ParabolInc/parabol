import styled from '@emotion/styled'
import React from 'react'
import defaultUserAvatar from '../styles/theme/images/avatar-user.svg'
import Avatar from './Avatar/Avatar'

const AvatarCol = styled('div')({
  display: 'flex',
  paddingRight: 12
})

const ColumnAvatar = styled(Avatar)({})

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
