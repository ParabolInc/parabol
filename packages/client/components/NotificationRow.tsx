import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV2'

const Row = styled('div')<{isNew: boolean}>(({isNew}) => ({
  background: isNew ? PALETTE.BACKGROUND_MAIN_DARKENED : '#fff',
  cursor: 'default',
  display: 'flex'
}))

const Avatar = styled('img')({
  borderRadius: '100%',
  height: 40,
  margin: 12,
  width: 40
})

const NewDotColumn = styled('div')({
  padding: 12
})

const Dot = styled('div')<{isNew: boolean}>(({isNew}) => ({
  background: PALETTE.BACKGROUND_PINK,
  borderRadius: 10,
  height: 8,
  width: 8,
  visibility: isNew ? undefined : 'hidden'
}))

interface Props {
  avatar: string
  children: ReactNode
  isNew: boolean
}

const NotificationRow = (props: Props) => {
  const {avatar, children, isNew} = props
  return (
    <Row isNew={isNew}>
      <Avatar src={avatar} />
      {children}
      <NewDotColumn>
        <Dot isNew={isNew} />
      </NewDotColumn>
    </Row>
  )
}

export default NotificationRow
