import React from 'react'
import styled from '@emotion/styled'
import Tag from './Tag/Tag'
import useAtmosphere from '../hooks/useAtmosphere'
import {PALETTE} from '../styles/paletteV2'

const Header = styled('div')({
  bottom: '100%',
  color: PALETTE.TEXT_RED,
  fontSize: 11,
  lineHeight: '18px',
  position: 'absolute',
  right: 0,
  textAlign: 'end'
})

interface Props {
  userId: string
  name: string
}

const UserDraggingHeader = (props: Props) => {
  const {userId, name} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const label = userId === viewerId ? 'Your ghost 👻' : name
  return (
    <Header>
      <Tag colorPalette='purple' label={label} />
    </Header>
  )
}

export default UserDraggingHeader
