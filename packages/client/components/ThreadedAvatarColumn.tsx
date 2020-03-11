import React from 'react'
import defaultUserAvatar from '../styles/theme/images/avatar-user.svg'
import styled from '@emotion/styled'
import Avatar from './Avatar/Avatar'
import Icon from './Icon'
import {PALETTE} from 'styles/paletteV2'

const AvatarCol = styled('div')({
  display: 'flex',
  paddingRight: 12
})

const ColumnAvatar = styled(Avatar)({})

const DeletedAvatar = styled(Icon)({
  alignItems: 'center',
  backgroundColor: PALETTE.TEXT_LIGHT_DARK,
  borderRadius: '8px',
  display: 'flex',
  fontSize: 24,
  height: 32,
  justifyContent: 'center',
  width: 32
})

interface Props {
  picture: string | null
}

const ThreadedAvatarColumn = (props: Props) => {
  const {picture} = props
  return (
    <AvatarCol>
      {picture === 'delete' ? (
        <DeletedAvatar>delete</DeletedAvatar>
      ) : (
        <ColumnAvatar size={32} picture={picture || defaultUserAvatar} />
      )}
    </AvatarCol>
  )
}

export default ThreadedAvatarColumn
