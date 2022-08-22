import styled from '@emotion/styled'
import {Bookmark, Comment, Delete, Edit, Keyboard} from '@mui/icons-material'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  paddingLeft: 8,
  paddingRight: 8,
  width: '100%'
})

const ItemIcon = styled('div')({
  color: PALETTE.SLATE_600,
  height: 24,
  width: 24,
  margin: 8
})

const Label = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 14,
  lineHeight: '32px'
})

interface Props {
  icon: string
  label: string
  dataCy: string
}

const MenuItemWithIcon = (props: Props) => {
  const {icon, label, dataCy} = props
  return (
    <Wrapper data-cy={`${dataCy}`}>
      <ItemIcon>
        {
          {
            delete: <Delete />,
            bookmark: <Bookmark />,
            keyboard: <Keyboard />,
            comment: <Comment />,
            edit: <Edit />
          }[icon]
        }
      </ItemIcon>
      <Label>{label}</Label>
    </Wrapper>
  )
}

export default MenuItemWithIcon
